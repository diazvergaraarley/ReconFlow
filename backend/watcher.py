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
        
        # =================================================================
        # 🚧 ZONA DE INTEGRACIÓN PARA EL SPRINT (Día 2)
        # =================================================================
        # Aquí es donde conectaremos el trabajo de IA Y BACKEND:
        #
        # 1. from ai_extractor import extraer_datos_factura
        # 2. json_ia = extraer_datos_factura(ruta_archivo)
        # 3. from database import reconciliar_factura
        # 4. reconciliar_factura(json_ia)
        # =================================================================
        
        print("[WATCHER] ✅ Simulación terminada. Esperando a integrar `ai_extractor.py`.\n")

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