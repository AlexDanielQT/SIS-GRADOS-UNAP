# SIS-GRADOS UNAP 🎓  
### Sistema Integral de Gestión de Grados y Títulos  
**Universidad Nacional del Altiplano**

Este es el repositorio oficial del proyecto **SIS-GRADOS**, una plataforma web desarrollada para automatizar la gestión de investigaciones, tesis y trámites de grados académicos en la **UNAP**. El sistema permite la interacción fluida entre estudiantes, docentes asesores y la oficina de investigación.

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para clonar el proyecto y ejecutarlo en tu entorno local:

### 1. Requisitos
- **Node.js**: Versión 18 o superior  
- **Gestor de paquetes**: npm (incluido con Node.js)

### 2. Instalación

Clona el repositorio y entra a la carpeta del proyecto:

```bash
git clone https://github.com/AlexDanielQT/SIS-GRADOS-UNAP
cd TESIS-FRONTEND
```

Instala todas las dependencias necesarias:

```bash
npm install
```

### 3. Ejecución

Inicia el servidor de desarrollo con Vite:

```bash
npm run dev
```

Accede desde tu navegador a:

```
http://localhost:5173
```

---

## 🛠️ Stack Tecnológico

- **Frontend**: React.js con Vite  
- **Base de Datos & Backend**: Supabase (PostgreSQL)  
- **Reportes**:  
  - jsPDF para documentos PDF  
  - XLSX para hojas de Excel  
- **Interfaz de Usuario**:  
  - CSS3 Moderno  
  - FontAwesome 6  
  - SweetAlert2  

---

## 🔑 Acceso al Sistema (Cuentas Demo)

Para facilitar las pruebas, el archivo `src/data/supabaseClient.js` ya cuenta con las credenciales de conexión.  
Puedes ingresar seleccionando los siguientes perfiles en el login:

| Rol | Usuario (Email) | Acciones Principales |
|----|------------------|----------------------|
| Administrador | soporte@unap.edu.pe | Gestión de usuarios y revisión de registros de auditoría |
| Oficina Inv. | mtorres@unap.edu.pe | Dashboard institucional y exportación de reportes maestros |
| Director | rgarcia@unap.edu.pe | Supervisión de tesis, aprobación de fases y observaciones |
| Tesista | jperez.est@unap.edu.pe | Subida de avances al repositorio y seguimiento de cronograma |

---

## 📂 Estructura del Código

```text
src/
├── data/
│   ├── supabaseClient.js
│   └── auditService.js
├── pages/
│   └── Vistas de la aplicación organizadas por módulos y roles
├── components/
│   └── Componentes UI reutilizables (Modales, Tablas, Layouts)
├── assets/
│   └── Recursos estáticos (Imágenes y estilos globales)
```

---

## 🛡️ Características de Seguridad

- **Registro de Auditoría (Audit Log)**  
  Todas las acciones críticas (logins, subida de archivos, aprobaciones) se guardan con fecha, usuario e IP de origen.

- **Control de Versiones**  
  El repositorio de documentos maneja versiones automáticas (`v1.0`, `v2.0`, etc.) para cada avance de tesis.

- **Alertas Tempranas (SAT)**  
  Filtros automáticos para detectar proyectos con alto riesgo académico o similitud excesiva en Turnitin.

---

## 📝 Notas para el Equipo de Desarrollo

- **Conectividad**:  
  No es necesario configurar archivos `.env` locales; la conexión a Supabase es directa a través de `supabaseClient.js`.

- **Git**:  
  Antes de realizar un `push`, asegúrate de que el proyecto compile correctamente:

```bash
npm run build
```

- **Estándares**:  
  - Mantener los nombres de los componentes en **inglés**  
  - Comentarios y textos de la interfaz en **español**

---

Proyecto desarrollado por estudiantes de **Ingeniería de Sistemas**  
**Universidad Nacional del Altiplano – Puno**
