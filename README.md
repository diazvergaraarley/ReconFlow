# ReconFlow: Extractor y Reconciliador de Facturas con IA

Bienvenido al repositorio central de **ReconFlow**. Este sistema automatiza la ingesta, extracción y validación de facturas (PDF/Imágenes) utilizando Google Gemini 1.5, FastAPI y React.

---

## 🚨 PASO 0: CLONAR EL REPOSITORIO Y CAMBIAR DE RAMA (¡OBLIGATORIO!)

La rama `main` está **ESTRICTAMENTE PROTEGIDA Y BLOQUEADA**. Si empiezas a trabajar y hacer *commits* en la rama `main`, GitHub rechazará tus cambios y no podrás subir tu código.

Lo primero que debes hacer es clonar el proyecto en tu computadora y pasarte **inmediatamente** a tu rama asignada. 

**1. Abre tu terminal y ejecuta esto para descargar el proyecto:**
```bash
git clone [https://github.com/diazvergaraarley/ReconFlow.git](https://github.com/diazvergaraarley/ReconFlow.git)
cd ReconFlow
2. Copia y pega ÚNICAMENTE el comando que te corresponde según tu rol:

Para Arley (Backend Lead):

Bash
git checkout backend-arley
Para Jesús (AI & Data Pipeline):

Bash
git checkout ia-jesus
Para Mauricio (Frontend Lead):

Bash
git checkout frontend-mauricio
(Asegúrate de que la terminal diga que cambiaste a la rama correctamente antes de continuar con las instalaciones).

⚙️ 1. Configuración de Entorno (Instalaciones)
Para evitar errores de versiones, sigue las instrucciones correspondientes a tu sistema operativo.

💡 Nota sobre Python: En los siguientes pasos, si usas Windows, el comando base suele ser python. Si usas Mac o Linux, el comando es python3.

Paso 1: Instalar Motores Base (Node.js y Python)
En Windows (Recomendado vía Winget - Rápido y sin errores de PATH):
Abre tu terminal (PowerShell o CMD como administrador) y ejecuta:

Bash
winget install OpenJS.NodeJS
winget install Python.Python.3.11
(Reinicia tu terminal después de instalarlos).

En Mac (Vía Homebrew):

Bash
brew install node
brew install python
En Linux (Ubuntu/Debian):

Bash
sudo apt update
sudo apt install nodejs npm
sudo apt install python3 python3-venv python3-pip
Paso 2: Configurar el Backend y Entorno Virtual (VENV)
El backend requiere un entorno aislado. Abre la terminal en la raíz del proyecto (ReconFlow/) y ejecuta:

En Windows:

Bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
En Mac / Linux:

Bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
⚠️ MUY IMPORTANTE (Variables de Entorno):
Antes de correr el servidor, debes crear un archivo llamado exactamente .env dentro de la carpeta backend. Pide la API Key por interno al equipo y pégala así (sin comillas ni espacios):

Plaintext
GEMINI_API_KEY=AIzaSyTuClaveAqui...
Paso 3: Configurar el Frontend
Abre una nueva pestaña de terminal en la raíz del proyecto (ReconFlow/) y ejecuta:

Bash
cd frontend
npm install
npm run dev
🔌 2. Endpoints y Conexión Frontend (Para Mauricio)
El Backend y la Inteligencia Artificial ya están 100% funcionales. Para que el Frontend pueda consumir los datos y procesar PDFs, debes levantar el servidor local.

Con el entorno virtual de Python activado en la carpeta backend, ejecuta:

Bash
uvicorn main:app --reload
Una vez levantado, la API estará disponible en http://127.0.0.1:8000. Tienes las siguientes rutas para conectar React:

GET /api/facturas:

Retorna un Array de objetos JSON con todas las facturas de la base de datos.

Uso sugerido: Llenar la tabla principal del Dashboard.

GET /api/facturas/{numero_factura}:

Retorna el detalle de una factura específica.

POST /api/facturas/procesar:

Recibe un archivo (PDF/Imagen) usando FormData con la llave archivo. La IA lo procesa en tiempo real y retorna el JSON estructurado con su estado de reconciliación.

Uso sugerido: Para el Dropzone / Botón de "Subir Factura" en la UI.

👥 3. Responsabilidades del Equipo
Arley (Backend & Scrum Master)

Responsabilidad: FastAPI, SQLite/SQLAlchemy, Folder Watcher y orquestación.

Recurso Clave: Usar el archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx para poblar la base de datos inicial.

Jesús (AI & Data Pipeline)

Responsabilidad: Integración con Gemini y Prompts de extracción.

Recurso Clave: Forzar a Gemini a devolver el JSON estructurado basándose exactamente en las columnas del archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx y el modelo Pydantic en models.py.

Mauricio (Frontend Lead)

Responsabilidad: Dashboard en React + Tailwind (v4) y visualización de anomalías.

Recurso Clave: Consumir las rutas de la API mencionadas arriba para construir la UI.

🏃‍♂️ 4. Plan de Sprint (Estado Actual)
✅ Parte 1 y 2 (Backend e IA) COMPLETADAS: La base de datos se autocompleta con el Excel, Gemini procesa imágenes/PDFs extrayendo el JSON, y el Watcher/API logran conciliar los montos, calculando estados como "Conciliado", "Discrepancia detectada" o "Sin registro contable".

⏳ Parte 3: UX y Entregables Gerenciales (En Progreso)

Mauricio: Implementar tabla de facturas y alertas visuales dependiendo del estado que devuelva la API. Implementar botón para subir archivos hacia el endpoint POST.

Arley/Jesús: Redactar los Entregables (Diagrama de Arquitectura, Matriz de Riesgos y DoD) demostrando la eficiencia del uso de SQLite y Gemini.

🚀 Flujo de Trabajo Diario (Git Flow)
Descarga los últimos cambios del equipo: git pull origin main

Asegúrate de estar en tu rama: git checkout <tu-rama>

Trabaja y guarda tus cambios: git commit -m "feat: agrega script de poblamiento db"

Sube tu rama a GitHub: git push

Ve a la página de GitHub y abre un Pull Request hacia la rama main.