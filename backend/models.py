from pydantic import BaseModel
from typing import Optional

# Este es el Contrato de Datos Oficial de ReconFlow
class FacturaSchema(BaseModel):
    numero_factura: str          # Ej: FE-123456
    fecha_emision: str           # Ej: 2023-10-25
    entidad_razon_social: str    # Ej: Novaventa S.A.S
    nit_proveedor: str           # Ej: 900123456-1
    concepto_operacion: str      # Ej: Mantenimiento de servidores
    subtotal_base_cop: float     # Ej: 1500000.00
    impuesto_iva_cop: float      # Ej: 285000.00
    total_factura_cop: float     # Ej: 1785000.00
    moneda: str = "COP"          # Por defecto COP
    estado_reconciliacion: Optional[str] = "Pendiente" # Pendiente, Procesado, Discrepancia