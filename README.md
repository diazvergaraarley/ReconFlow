Markdown
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
Paso 3: Configurar el Frontend
Abre una nueva pestaña de terminal en la raíz del proyecto (ReconFlow/) y ejecuta:

Bash
cd frontend
npm install
npm run dev
👥 2. Responsabilidades del Equipo
Arley (Backend & Scrum Master)

Responsabilidad: FastAPI, SQLite/SQLAlchemy, Folder Watcher y orquestación.

Recurso Clave: Usar el archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx para poblar la base de datos inicial.

Jesús (AI & Data Pipeline)

Responsabilidad: Integración con Gemini y Prompts de extracción.

Recurso Clave: Forzar a Gemini a devolver el JSON estructurado basándose exactamente en las columnas del archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx y el modelo Pydantic en models.py.

Mauricio (Frontend Lead)

Responsabilidad: Dashboard en React + Tailwind (v4) y visualización de anomalías.

Recurso Clave: Maquetar la tabla de datos y las tarjetas utilizando la estructura del archivo P4_Facturas_Finanzas.xlsx como fuente de verdad para el diseño, sin esperar a que la API esté lista.

🏃‍♂️ 3. Plan de Sprint (3 Días)
Gracias a la herramienta mock_generator provista, ya tenemos los datos de prueba y el esquema definido.

Parte 1: Sembrado de Datos y Contratos (Trabajo Paralelo)
Arley: Escribir un script (database.py) que lea el archivo P4_Facturas_Finanzas.xlsx y lo inserte automáticamente en SQLite para simular nuestro sistema contable ya poblado. Exponer esto en un Endpoint de FastAPI.

Jesús: Escribir el script de IA (ai_extractor.py) importando el esquema de models.py. El objetivo es pasarle un PDF a Gemini y lograr que devuelva un JSON que coincida al 100% con los campos del Excel.

Mauricio: Construir la UI estática. Puedes exportar unas cuantas filas de P4_Facturas_Finanzas.xlsx a formato JSON y usarlas directamente en React para maquetar la tabla y los estados (Pendiente, Procesado, Discrepancia detectada).

Parte 2: Integración del Core (Reconciliación)
Arley & Jesús: Conectar el Folder Watcher. Cuando caiga un PDF nuevo, pasarlo al script de Jesús, obtener el JSON, y buscar en la base de datos (SQLite) si los montos coinciden. Actualizar el estado de reconciliación según el resultado.

Arley & Mauricio: Conectar el Frontend a FastAPI. Mauricio cambia su JSON estático por peticiones fetch reales al puerto 8000.

Parte 3: UX y Entregables Gerenciales
Mauricio: Implementar alertas visuales (ej. pintar la fila de rojo si la API devuelve "Discrepancia detectada").

Jesús: Manejo de casos de borde (imágenes de baja calidad, facturas sin NIT).

Arley: Redactar los Entregables (Diagrama de Arquitectura, Matriz de Riesgos y DoD) demostrando la eficiencia del uso de SQLite y Gemini.

🚀 Flujo de Trabajo Diario (Git Flow)
Descarga los últimos cambios del equipo: git pull origin main

Asegúrate de estar en tu rama: git checkout <tu-rama>

Trabaja y guarda tus cambios: git commit -m "feat: agrega script de poblamiento db"

Sube tu rama a GitHub: git push

Ve a la página de GitHub y abre un Pull Request hacia la rama main.