import os
import sys
from pathlib import Path
from typing import Union

import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel

from models import FacturaSchema

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "Falta GEMINI_API_KEY en backend/.env. "
        "Consigue una key gratis en https://aistudio.google.com/apikey "
        "y agrega la linea GEMINI_API_KEY=tu_key en backend/.env"
    )

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-3.5-flash"

PROMPT = """
Eres un motor de extraccion de datos financieros. Analiza la factura adjunta (PDF o imagen)
y extrae los campos solicitados en el esquema JSON.

Reglas:
- fecha_emision debe ir en formato YYYY-MM-DD.
- Los montos (subtotal_base_cop, impuesto_iva_cop, total_factura_cop) deben ser numeros
  planos, sin simbolos de moneda ni separadores de miles.
- moneda por defecto es "COP" si el documento no indica otra.
- Si un campo no aparece en el documento, usa "" para strings o 0 para numeros.
  Nunca inventes cifras que no esten respaldadas por el documento.
- No agregues campos ni texto fuera del JSON.
"""


class ExtractedInvoiceSchema(BaseModel):
    """Subconjunto de FacturaSchema que la IA puede inferir de un documento.
    Excluye estado_reconciliacion: ese campo lo calcula la logica de reconciliacion, no la IA.
    """

    numero_factura: str
    fecha_emision: str
    entidad_razon_social: str
    nit_proveedor: str
    concepto_operacion: str
    subtotal_base_cop: float
    impuesto_iva_cop: float
    total_factura_cop: float
    moneda: str = "COP"


def extract_invoice_data(file_path: Union[str, Path]) -> FacturaSchema:
    """Envia un PDF/imagen de factura a Gemini y devuelve los datos extraidos como FacturaSchema."""
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"No se encontro el archivo: {file_path}")

    uploaded_file = genai.upload_file(path=str(file_path))

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(
        [PROMPT, uploaded_file],
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=ExtractedInvoiceSchema,
        ),
    )

    extracted = ExtractedInvoiceSchema.model_validate_json(response.text)
    return FacturaSchema(**extracted.model_dump(), estado_reconciliacion="Pendiente")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python ai_extractor.py <ruta_al_pdf_o_imagen>")
        sys.exit(1)

    resultado = extract_invoice_data(sys.argv[1])
    print(resultado.model_dump_json(indent=2))
