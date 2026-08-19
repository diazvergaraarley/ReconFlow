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