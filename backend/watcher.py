import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Definimos los formatos de archivo que nos interesa procesar
FORMATOS_PERMITIDOS = {".pdf", ".png", ".jpg", ".jpeg"}

class FacturaEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        # Ignorar si lo que se creó fue una subcarpeta
        if event.is_directory:
            return
        
        ruta_archivo = event.src_path
        nombre_archivo = os.path.basename(ruta_archivo)
        _, extension = os.path.splitext(nombre_archivo)
        
        # Filtrar solo PDFs o Imágenes
        if extension.lower() in FORMATOS_PERMITIDOS:
            print(f"\n[WATCHER] 📄 ¡Nuevo documento detectado!: {nombre_archivo}")
            print("[WATCHER] ⏳ Asegurando integridad del archivo (esperando volcado de bytes)...")
            time.sleep(2)  # Pausa táctica para evitar leer un archivo a medio copiar
            
            self.procesar_factura(ruta_archivo)
        elif extension.lower() != ".xlsx": # Ignoramos el Excel del mock si cae ahí
            print(f"\n[WATCHER] ⚠️ Archivo ignorado ({extension}): {nombre_archivo}")

    def procesar_factura(self, ruta_archivo):
        print(f"[WATCHER] 🚀 Pasando el control al Pipeline de IA...")
        
        # Importamos las herramientas que construimos en el equipo
        from ai_extractor import extract_invoice_data
        from database import SessionLocal, reconciliar_factura
        
        try:
            # 1. La IA lee el documento físico
            print("[WATCHER] 🧠 Gemini está leyendo el documento...")
            factura_extraida = extract_invoice_data(ruta_archivo)
            print(f"[WATCHER] 📊 Datos extraídos: Factura {factura_extraida.numero_factura} por {factura_extraida.total_factura_cop} COP")
            
            # 2. Abrimos conexión a la base de datos
            db = SessionLocal()
            try:
                # 3. Comparamos contra el sistema contable
                print("[WATCHER] ⚖️ Reconciliando con la base de datos...")
                factura_final = reconciliar_factura(db, factura_extraida)
                
                # 4. Resultado final
                if factura_final.estado_reconciliacion == "Conciliado":
                    print(f"[WATCHER] ✅ ¡ÉXITO! La factura cuadra perfectamente.")
                else:
                    print(f"[WATCHER] ❌ ALERTA: {factura_final.estado_reconciliacion.upper()}")
            finally:
                # Siempre cerramos la base de datos
                db.close()
                
        except Exception as e:
            print(f"\n[WATCHER] 💥 Error crítico procesando {ruta_archivo}: {str(e)}\n")

def iniciar_observador():
    # Detectar dinámicamente la carpeta input_invoices
    directorio_base = os.path.dirname(__file__)
    carpeta_objetivo = os.path.join(directorio_base, "input_invoices")
    
    # Crear la carpeta si alguien la borró accidentalmente
    os.makedirs(carpeta_objetivo, exist_ok=True)
    
    event_handler = FacturaEventHandler()
    observer = Observer()
    
    # Configuramos el observador
    observer.schedule(event_handler, carpeta_objetivo, recursive=False)
    
    print("=========================================================")
    print(f" 👀 RECONFLOW WATCHER INICIADO")
    print(f" 📂 Escuchando cambios en: {carpeta_objetivo}")
    print(" 🛑 Presiona Ctrl+C para detener el servicio.")
    print("=========================================================\n")
    
    observer.start()
    try:
        # Mantenemos el script vivo
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n🛑 Watcher apagado de forma segura.")
    observer.join()

if __name__ == "__main__":
    iniciar_observador()