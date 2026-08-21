import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, Depends, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager
from ai_extractor import extract_invoice_data
from database import init_db, get_db, reconciliar_factura
from models import FacturaDB, FacturaSchema

# 1. Ciclo de vida de la app: Inicializar la base de datos al arrancar
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando ReconFlow API...")
    init_db() # Lee el Excel y puebla SQLite si está vacío
    yield
    print("Apagando ReconFlow API...")

# 2. Inicialización de FastAPI
app = FastAPI(title="ReconFlow API", lifespan=lifespan)

# 3. Configuración de CORS para permitir peticiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se restringe al dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ENDPOINTS (RUTAS API)
# ==========================================

@app.get("/")
def read_root():
    return {"mensaje": "ReconFlow API está en línea."}

@app.get("/api/facturas", response_model=List[FacturaSchema])
def obtener_facturas(db: Session = Depends(get_db)):
    """
    Retorna la lista completa de facturas almacenadas en la base de datos.
    el Frontend usará este endpoint para llenar la tabla principal.
    """
    facturas = db.query(FacturaDB).all()
    return facturas

@app.get("/api/facturas/{numero_factura}", response_model=FacturaSchema)
def obtener_factura_por_numero(numero_factura: str, db: Session = Depends(get_db)):
    """
    Retorna una factura específica usando su número (Ej: FE-123456).
    Útil para cuando el Frontend quiera mostrar los detalles en un panel lateral.
    """
    factura = db.query(FacturaDB).filter(FacturaDB.numero_factura == numero_factura).first()
    return factura

@app.post("/api/facturas/procesar", response_model=FacturaSchema)
async def procesar_factura(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recibe un PDF/imagen de factura, la envía a Gemini para extraer sus datos
    y concilia el resultado contra el sistema contable sembrado en SQLite.
    Este es el endpoint que usará el Folder Watcher cada vez que caiga un archivo nuevo.
    """
    sufijo = Path(archivo.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=sufijo) as tmp:
        shutil.copyfileobj(archivo.file, tmp)
        ruta_temporal = Path(tmp.name)

    try:
        factura_extraida = extract_invoice_data(ruta_temporal)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"No se pudo extraer la factura: {exc}")
    finally:
        ruta_temporal.unlink(missing_ok=True)

    return reconciliar_factura(db, factura_extraida)

# ==========================================
# ENDPOINT DE CARGA MASIVA 
# ==========================================
@app.post("/api/facturas/lote")
async def procesar_lote_excel(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    """Recibe un archivo Excel y puebla la base de datos de forma masiva sin usar IA."""
    import pandas as pd
    import io

    if not archivo.filename.lower().endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Formato inválido. Sube un archivo .xlsx")

    try:
        contenido = await archivo.read()
        buffer = io.BytesIO(contenido)
        df = pd.read_excel(buffer)
        
        # Limpiamos espacios invisibles
        df.columns = df.columns.str.strip()
        
        
        if "numero_factura" not in df.columns:
            columnas_reales = ", ".join(list(df.columns))
            raise ValueError(f"No se encontró 'numero_factura'. El archivo tiene estas columnas: {columnas_reales}")

        nuevos_registros = 0
        for _, row in df.iterrows():
            existe = db.query(FacturaDB).filter(FacturaDB.numero_factura == str(row["numero_factura"])).first()
            if not existe:
                nueva = FacturaDB(
                    numero_factura=str(row["numero_factura"]),
                    fecha_emision=str(row["fecha_emision"]),
                    entidad_razon_social=str(row["entidad_razon_social"]),
                    nit_proveedor=str(row["nit_proveedor"]),
                    concepto_operacion=str(row["concepto_operacion"]),
                    subtotal_base_cop=float(row["subtotal_base_cop"]),
                    impuesto_iva_cop=float(row["impuesto_iva_cop"]),
                    total_factura_cop=float(row["total_factura_cop"]),
                    moneda=str(row["moneda"]),
                    estado_reconciliacion=str(row.get("estado_reconciliacion", "Pendiente"))
                )
                db.add(nueva)
                nuevos_registros += 1
                
        db.commit()
        return {"mensaje": f"Carga masiva exitosa: {nuevos_registros} facturas nuevas registradas."}
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Error leyendo Excel: {str(e)}")