from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import Optional

# Base para los modelos de SQLAlchemy (Base de Datos)
Base = declarative_base()

# ==========================================
# 1. MODELO DE BASE DE DATOS (SQLAlchemy)
# ==========================================
class FacturaDB(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, index=True)
    numero_factura = Column(String, unique=True, index=True)
    fecha_emision = Column(String)
    entidad_razon_social = Column(String)
    nit_proveedor = Column(String)
    concepto_operacion = Column(String)
    subtotal_base_cop = Column(Float)
    impuesto_iva_cop = Column(Float)
    total_factura_cop = Column(Float)
    moneda = Column(String, default="COP")
    estado_reconciliacion = Column(String, default="Pendiente")

# ==========================================
# 2. ESQUEMA DE DATOS (Pydantic / Contrato API)
# ==========================================
class FacturaSchema(BaseModel):
    numero_factura: str
    fecha_emision: str
    entidad_razon_social: str
    nit_proveedor: str
    concepto_operacion: str
    subtotal_base_cop: float
    impuesto_iva_cop: float
    total_factura_cop: float
    moneda: str = "COP"
    estado_reconciliacion: Optional[str] = "Pendiente"

    class Config:
        from_attributes = True  # Permite que Pydantic lea directamente de SQLAlchemy