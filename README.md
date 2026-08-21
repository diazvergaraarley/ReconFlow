# 📊 ReconFlow: Auditoría y Reconciliación Inteligente

ReconFlow es una plataforma Full-Stack B2B diseñada para automatizar la extracción, validación y reconciliación de facturas financieras. Utiliza Inteligencia Artificial multimodal para procesar documentos heterogéneos y un motor de base de datos para detectar discrepancias contables en tiempo real.

## 📑 Ficha Técnica
* **Rol:** Lead Técnico / Full-Stack Developer
* **Frontend:** React, Vite, Tailwind CSS, Lucide React (UI/UX *Liquid Glass*).
* **Backend:** Python, FastAPI, SQLAlchemy (SQLite).
* **Inteligencia Artificial:** Google Gemini (Procesamiento Multimodal / Zero-Shot).
* **Arquitectura:** Cliente-Servidor con Pipeline de Ingesta Masiva y filtrado de alto rendimiento (DOM Repaint Optimization).

---

## 💻 Instrucciones de Ejecución (Paso a Paso)

Sigue estas instrucciones en tu terminal para clonar y correr el proyecto en tu entorno local.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/reconflow.git](https://github.com/TU_USUARIO/reconflow.git)
cd reconflow

2. Configurar el Backend (FastAPI)
Abre una terminal nueva y ejecuta los siguientes comandos para crear el entorno virtual, instalar dependencias e iniciar el servidor:

cd backend

# Crear y activar entorno virtual (Mac/Linux)
python3 -m venv .venv
source .venv/bin/activate
# (Si usas Windows: .venv\Scripts\activate)

# Instalar dependencias
pip install -r requirements.txt

⚠️ Importante (Variables de Entorno):
Antes de correr el servidor, crea un archivo llamado .env dentro de la carpeta backend y agrega tu llave de Google Gemini:
GEMINI_API_KEY=tu_llave_aqui

# Iniciar el servidor backend
uvicorn main:app --reload

El servidor correrá en http://127.0.0.1:8000

3. Configurar el Frontend (React)
Abre otra terminal nueva, separada de la del backend:

cd frontend

# Instalar los paquetes de Node
npm install

# Levantar la interfaz de usuario
npm run dev

La aplicación web estará disponible en http://localhost:5173

🧪 Cómo usar la aplicación
Carga por IA: Arrastra un archivo .pdf, .jpg o .png al área de carga. El sistema consumirá Gemini para extraer los datos y los reconciliará con la base de datos.

Carga Masiva (Data Histórica): Arrastra un archivo .xlsx. El sistema eludirá la IA e inyectará los registros directamente a la base de datos sin consumir tokens.

Auditoría: Navega a la pestaña de Auditoría para ver los estados (Conciliado, Discrepancia, Sin Registro) y utiliza la barra lateral para un filtrado cruzado de alto rendimiento.

