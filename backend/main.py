from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager
from database import init_db, get_db
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