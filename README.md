# ReconFlow: Extractor y Reconciliador de Facturas con IA

Bienvenido al repositorio central de **ReconFlow**. Este sistema automatiza la ingesta, extracción y validación de facturas (PDF/Imágenes) utilizando Google Gemini 1.5, FastAPI y React.

---

## ⚙️ 1. Configuración de Entorno (Instalación Segura)

Para evitar errores de versiones al ejecutar el proyecto, sigue las instrucciones correspondientes a tu sistema operativo. 

> **💡 Nota sobre Python:** En los siguientes pasos, si usas Windows, el comando base suele ser `python`. Si usas Mac o Linux, el comando es `python3`.

### Paso 1: Instalar Motores Base (Node.js y Python)

**En Windows (Recomendado vía Winget - Rápido y sin errores de PATH):**
Abre tu terminal (PowerShell o CMD como administrador) y ejecuta:
```bash

winget install OpenJS.NodeJS
winget install Python.Python.3.11

(Reinicia tu terminal después de instalarlos).

En Mac (Vía Homebrew):


brew install node
brew install python


En Linux (Ubuntu/Debian):


sudo apt update
sudo apt install nodejs npm
sudo apt install python3 python3-venv python3-pip

Paso 2: Configurar el Backend y Entorno Virtual (VENV)
El backend requiere un entorno aislado. Abre la terminal en la raíz del proyecto y ejecuta:

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
Abre una nueva pestaña de terminal en la raíz del proyecto y ejecuta:

Bash
cd frontend
npm install
npm run dev

👥 2. Equipo y Ramas Asignadas
El trabajo en la rama main está bloqueado. Todo el desarrollo debe hacerse en la rama asignada y unirse mediante Pull Requests (PR). Para empezar a trabajar en el proyecto, inicien directamente haciendo git checkout <nombre-de-rama>.

Arley (Backend Lead & Scrum Master) -> Rama: backend-arley

Responsabilidad: FastAPI, SQLite/SQLAlchemy, Folder Watcher y orquestación.

Recurso Clave: Usar el archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx para poblar la base de datos inicial.

Jesús (AI & Data Pipeline) -> Rama: ia-jesus

Responsabilidad: Integración con Gemini y Prompts de extracción.

Recurso Clave: Forzar a Gemini a devolver el JSON estructurado basándose exactamente en las columnas del archivo backend/input_invoices/P4_Facturas_Finanzas.xlsx y el modelo Pydantic en models.py.

Mauricio (Frontend Lead) -> Rama: frontend-mauricio

Responsabilidad: Dashboard en React + Tailwind (v4) y visualización de anomalías.

Recurso Clave: Maquetar la tabla de datos y las tarjetas utilizando la estructura del archivo P4_Facturas_Finanzas.xlsx como fuente de verdad para el diseño, sin esperar a que la API esté lista.

🏃‍♂️ 3. Plan de Sprint (3 Días)
Gracias a la herramienta mock_generator provista, ya tenemos los datos de prueba y el esquema definido. Esto elimina la necesidad de diseñar la base de datos desde cero.

###  Parte 1: Sembrado de Datos y Contratos (Trabajo Paralelo)
Arley: Escribir un script (database.py) que lea el archivo P4_Facturas_Finanzas.xlsx y lo inserte automáticamente en SQLite para simular nuestro sistema contable ya poblado. Exponer esto en un Endpoint de FastAPI.

Jesús: Escribir el script de IA (ai_extractor.py) importando el esquema de models.py. El objetivo es pasarle un PDF a Gemini y lograr que devuelva un JSON que coincida al 100% con los campos del Excel.

Mauricio: Construir la UI estática. Puedes exportar unas cuantas filas de P4_Facturas_Finanzas.xlsx a formato JSON y usarlas directamente en React para maquetar la tabla y los estados (Pendiente, Procesado, Discrepancia detectada).

### Parte 2: Integración del Core (Reconciliación)
Arley & Jesús: Conectar el Folder Watcher. Cuando caiga un PDF nuevo, pasarlo al script de Jesús, obtener el JSON, y buscar en la base de datos (SQLite) si los montos coinciden. Actualizar el estado de reconciliación según el resultado.

Arley & Mauricio: Conectar el Frontend a FastAPI. Mauricio cambia su JSON estático por peticiones fetch reales al puerto 8000.

Parte 3: UX y Entregables Gerenciales
Mauricio: Implementar alertas visuales (ej. pintar la fila de rojo si la API devuelve "Discrepancia detectada").

Jesús: Manejo de casos de borde (imágenes de baja calidad, facturas sin NIT).

Arley: Redactar los Entregables (Diagrama de Arquitectura, Matriz de Riesgos y DoD) demostrando la eficiencia del uso de SQLite y Gemini.

## 🚀 Flujo de Trabajo (Git Flow)
1. Descarga los últimos cambios: `git pull origin main`
2. Muévete a tu rama: `git checkout <tu-rama>`
3. Trabaja y haz commits: `git commit -m "feat: agrega tabla de facturas"`
4. Sube tus cambios: `git push`
5. Ve a GitHub y abre un **Pull Request** hacia `main`. Solicita la revisión de un compañero.