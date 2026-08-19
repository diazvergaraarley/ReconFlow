import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, FacturaDB, FacturaSchema

# 1. Configuración de la conexión SQLite
# SQLite guardará todo en un archivo local llamado reconflow.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./reconflow.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Función para inicializar y poblar la Base de Datos
def init_db():
    # Crea las tablas en la base de datos si no existen
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Verificamos si ya hay datos. Si la tabla está vacía, la poblamos.
    if db.query(FacturaDB).first() is None:
        print("Base de datos vacía. Iniciando poblado desde Excel...")
        
        # Ruta dinámica al archivo Excel
        ruta_excel = os.path.join(os.path.dirname(__file__), "input_invoices", "P4_Facturas_Finanzas.xlsx")
        
        if os.path.exists(ruta_excel):
            # Leer el Excel con Pandas
            df = pd.read_excel(ruta_excel)
            
            # Convertir cada fila del Excel en un objeto de SQLAlchemy y agregarlo
            for _, row in df.iterrows():
                nueva_factura = FacturaDB(
                    numero_factura=str(row["Numero_Factura"]),
                    fecha_emision=str(row["Fecha_Emision"]),
                    entidad_razon_social=str(row["Entidad_Razon_Social"]),
                    nit_proveedor=str(row["NIT_Proveedor"]),
                    concepto_operacion=str(row["Concepto_Operacion"]),
                    subtotal_base_cop=float(row["Subtotal_Base_COP"]),
                    impuesto_iva_cop=float(row["Impuesto_IVA_COP"]),
                    total_factura_cop=float(row["Total_Factura_COP"]),
                    moneda=str(row["Moneda"]),
                    estado_reconciliacion=str(row["Estado_Reconciliacion"])
                )
                db.add(nueva_factura)
            
            # Guardamos los cambios en la base de datos
            db.commit()
            print(f"¡Éxito! Se insertaron {len(df)} facturas en SQLite.")
        else:
            print(f"[ADVERTENCIA] No se encontró el archivo Excel en: {ruta_excel}")
    else:
        print("La base de datos ya contiene información. Omitiendo poblado inicial.")
        
    db.close()

# 3. Dependencia para inyectar la sesión en FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Reconciliación: contrasta una factura extraída por Gemini contra el sistema contable
def reconciliar_factura(db, factura_extraida: FacturaSchema) -> FacturaDB:
    """
    Busca en SQLite la factura sembrada desde el Excel contable y la compara
    contra los datos que la IA extrajo del PDF/imagen.

    - Si el número de factura no existe en el sistema contable: "Sin registro contable".
    - Si el total coincide (tolerancia de 1 COP por redondeos): "Conciliado".
    - Si el total no coincide: "Discrepancia detectada".
    """
    TOLERANCIA_COP = 1.0

    factura_db = (
        db.query(FacturaDB)
        .filter(FacturaDB.numero_factura == factura_extraida.numero_factura)
        .first()
    )

    if factura_db is None:
        factura_db = FacturaDB(**factura_extraida.model_dump())
        factura_db.estado_reconciliacion = "Sin registro contable"
        db.add(factura_db)
    else:
        diferencia = abs(factura_db.total_factura_cop - factura_extraida.total_factura_cop)
        factura_db.estado_reconciliacion = (
            "Conciliado" if diferencia <= TOLERANCIA_COP else "Discrepancia detectada"
        )

    db.commit()
    db.refresh(factura_db)
    return factura_db

# Bloque de prueba: Si ejecutas este archivo directamente, inicializará la BD.
if __name__ == "__main__":
    init_db()
    
    