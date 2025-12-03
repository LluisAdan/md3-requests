# md3-requests — Portal Interno de Solicitudes

Sistema moderno de gestión de incidencias y solicitudes internas, construido con **Supabase**, **Lovable (React)** y **Make** para automatizaciones.  
Diseñado como una herramienta real de uso interno para equipos de IT, soporte o automatización.


## Funcionalidades principales

### 1. Autenticación y perfiles

- Inicio de sesión y registro con **Supabase Auth**  
- Tabla `profiles` sincronizada automáticamente con los usuarios  
- Guardado del nombre del usuario para mostrarlo en la UI  
- Navbar con avatar (inicial) + nombre o email del usuario autenticado  

### 2. Gestión de solicitudes

- Creación de nuevas incidencias con:
  - Título  
  - Descripción  
  - Tipo  
  - Prioridad  
- Flujo completo de estados:
  - "open"
  - "in-progress"  
  - "completed"  
  - "closed" (estado final bloqueado, no editable desde el selector)  
- Botón **Reopen** cuando una solicitud cerrada necesita reabrirse  
- Vista de detalle con toda la información organizada (metadatos, creador, descripción, etc.)


### 3. Auditoría completa (activity logs)

Todas las acciones importantes quedan registradas en la tabla "request_logs":

- "REQUEST_CREATED"
- "STATUS_CHANGED"
- Fecha, hora, usuario y detalles de la acción  
- Visualización en **timeline vertical** dentro del detalle de la solicitud

Esto da un nivel profesional de trazabilidad similar al de herramientas internas reales.


### 4. Dashboard con métricas

Panel con tarjetas de KPI calculadas en tiempo real desde Supabase:

- Solicitudes totales  
- Solicitudes abiertas  
- Solicitudes completadas  
- Solicitudes de prioridad alta  

Además, un **gráfico tipo donut** muestra la distribución por estado:

- "open" 
- "in-progress"  
- "completed"  
- "closed"  


### 5. UI/UX moderna (dark mode corporativo)

Construido visualmente con Lovable manteniendo un estándar profesional:

- Estética dark moderna estilo SaaS  
- Badges personalizados por estado y prioridad  
- Diseño responsive (sidebar en escritorio, topbar en móvil)  
- Scroll horizontal en tablas cuando es necesario  
- Componentes UI consistentes (cards, badges, select, timeline, etc.)


## Arquitectura del proyecto

Frontend (Lovable / React)
      │
      ▼
Supabase
  - Auth
  - Postgres (requests, profiles, request_logs)
  - RLS (Row Level Security)
      │
      ▼
Make (escenarios de automatización opcionales)


## Modelo de datos (Supabase)

### Tabla: "requests"

| Campo       | Tipo        | Descripción                                      |
|------------|-------------|--------------------------------------------------|
| id         | uuid (PK)   | Identificador interno autogenerado               |
| public_id  | text        | ID legible tipo "REQ-2025-XXXX"                  |
| title      | text        | Título de la solicitud                           |
| description| text        | Descripción completa                             |
| type       | text        | Categoría / tipo de solicitud                    |
| priority   | text        | "low" / "medium" / "high"                        |
| status     | text        | "open" / "in-progress" / "completed" / "closed"  |
| created_by | uuid (FK)   | Referencia a "profiles.id"                       |
| created_at | timestamptz | Fecha de creación                                |
| updated_at | timestamptz | Fecha de última actualización                    |


### Tabla: "profiles"

| Campo | Tipo        | Descripción                                   |
|-------|-------------|-----------------------------------------------|
| id    | uuid (PK)   | Igual que "auth.users.id"                     |
| email | text        | Email del usuario                             |
| name  | text        | Nombre para mostrar en la interfaz            |


### Tabla: "request_logs"

| Campo      | Tipo        | Descripción                                  |
|------------|-------------|----------------------------------------------|
| id         | uuid (PK)   | Identificador del log                         |
| request_id | uuid (FK)   | Referencia a "requests.id"                    |
| event      | text        | "REQUEST_CREATED", "STATUS_CHANGED", etc.     |
| details    | jsonb       | Información adicional (public_id, source...)  |
| created_at | timestamptz | Fecha y hora del evento                       |


## Seguridad (RLS)

El proyecto utiliza **Row Level Security** en Supabase.

### En "profiles":
- Los usuarios solo pueden leer/actualizar su propio perfil.  
- Se permite leer los perfiles de otros usuarios para poder mostrar el nombre del creador en las solicitudes (sin exponer datos sensibles).

### En "requests":
- Los usuarios autenticados pueden ver las solicitudes (modelo típico de herramienta interna).  
- La lógica de bloqueo cuando "status = closed" se aplica desde la UI (no editable desde el selector; solo reabrible con botón dedicado).


## Demo online

https://requests-portal.lovable.app


## Ejecución local (si se exporta el código)

Si en algún momento migras a un proyecto React estándar:

```bash
npm install
npm run dev
export VITE_SUPABASE_URL=tu_url
export VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Automatizaciones con Make (idea general)

Este portal está preparado para integrarse con escenarios de Make, por ejemplo:
- Enviar un email al creador al crear una solicitud.
- Notificar en Slack/Teams cuando una solicitud de prioridad alta pasa a in-progress.
- Enviar resúmenes diarios/semanales de solicitudes abiertas.
- Registrar logs o métricas adicionales fuera de la app.


## Mejoras futuras (roadmap)

- Sistema de roles (admin / agente / solicitante).
- Campo assigned_to con permisos según rol.
- Adjuntos de archivos.
- SLA y recordatorios automáticos.
- Búsqueda avanzada y filtros guardados.
- Multi-tenant (varias empresas/unidades).
- Integración con Jira / Linear.

## Autor

Lluís Adán — Desarrollador de automatización e internal tools.
https://linkedin.com/in/lluis-adan
