# md3-requests — Portal Interno de Solicitudes

Sistema moderno de gestión de incidencias y solicitudes internas, construido con **Supabase** y **Lovable (React)**.
Diseñado como herramienta real para equipos de IT/soporte/automatización.

> **Demo:** [https://md3-requests.lovable.app](https://md3-requests.lovable.app)
> **Credenciales demo:**
> Usuario: `demo@md3-requests.com`
> Contraseña: `Demo1234!`
> *(Perfil con nombre “Demo”; datos de prueba incluidos.)*


## Funcionalidades principales

### 1) Autenticación y perfiles

* Login con **Supabase Auth**.
* Tabla `profiles` enlazada a `auth.users` (muestra **nombre** del creador en la UI).
* Navbar con avatar (inicial) + nombre/email del usuario autenticado.

### 2) Gestión de solicitudes

* Crear solicitud con **título, descripción, tipo, prioridad**.
* Flujo de estados:

  * `open`, `in-progress`, `completed`, `closed`
* **`closed`**: estado final **bloqueado** (no editable en selector); botón **Reopen** para reabrir.
* Listado **ordena `closed` al final** automáticamente.

### 3) Auditoría (activity logs)

* Tabla `request_logs` registra:

  * `REQUEST_CREATED`, `STATUS_CHANGED`, fecha/hora, usuario y detalles.
* Visualización en **timeline vertical** en el detalle.

### 4) Dashboard

* KPIs: **totales**, **abiertas**, **alta prioridad**.
* **Gráfico donut** por estado: open / in-progress / completed / closed.

### 5) UI/UX (dark, responsive)

* Estética SaaS oscura, consistente.
* Badges por **estado** y **prioridad**.
* Responsive (sidebar en desktop / topbar en móvil).
* Tablas con scroll cuando procede.


## Arquitectura

```text
Frontend (Lovable / React)
      │
      ▼
Supabase
  - Auth
  - Postgres (requests, profiles, request_logs)
  - RLS (Row Level Security)
```

> **Automatizaciones (opcional/futuro):** el proyecto está preparado para integrarse con Make/Slack/Email, pero **no** se incluye en esta versión.


## 🗃️ Modelo de datos (Supabase)

### `requests`

| Campo       | Tipo        | Descripción                                     |
| ----------- | ----------- | ----------------------------------------------- |
| id          | uuid (PK)   | Identificador interno                           |
| public_id   | text        | ID legible tipo `REQ-2025-XXXX`                 |
| title       | text        | Título                                          |
| description | text        | Descripción                                     |
| type        | text        | `feature` / `support` / `bug` / `other`         |
| priority    | text        | `low` / `medium` / `high`                       |
| status      | text        | `open` / `in-progress` / `completed` / `closed` |
| created_by  | uuid (FK)   | → `profiles.id`                                 |
| created_at  | timestamptz | Creación                                        |
| updated_at  | timestamptz | Última actualización                            |

### `profiles`

| Campo | Tipo      | Descripción                   |
| ----- | --------- | ----------------------------- |
| id    | uuid (PK) | **Igual que `auth.users.id`** |
| email | text      | Email                         |
| name  | text      | Nombre visible en UI          |

### `request_logs`

| Campo      | Tipo        | Descripción                            |
| ---------- | ----------- | -------------------------------------- |
| id         | uuid (PK)   | Identificador                          |
| request_id | uuid (FK)   | → `requests.id`                        |
| event      | text        | `REQUEST_CREATED`, `STATUS_CHANGED`, … |
| details    | jsonb       | Extra (p.ej. `public_id`, `source`)    |
| created_at | timestamptz | Fecha/hora                             |


## Seguridad (RLS)

* **`profiles`**

  * Los usuarios **leen/actualizan solo su perfil**.
  * Se permite leer perfiles necesarios para mostrar el nombre del creador en las solicitudes (solo campos no sensibles).

* **`requests`**

  * Usuarios autenticados pueden **ver** solicitudes (modelo típico interno).
  * La lógica de bloqueo de `closed` se aplica en la **UI** (no editable en selector; reabrible con botón).

> Nota: si exportas el proyecto y quieres endurecer reglas (p.ej. impedir updates en `closed` desde SQL), puedes añadir una policy `FOR UPDATE` que deniegue cambios cuando `status = 'closed'`.


## Ejecución local (si exportas el código)

```bash
npm install
npm run dev
```

Variables de entorno necesarias:

```bash
# .env.local (Vite)
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

> **Privadas** (no subir a Git): claves **service-role / secret** de Supabase son **solo para backend**. En frontend usa **ANON/PUBLISHABLE**.


## Roadmap corto

* Roles (`admin` / `agent` / `requester`) y `assigned_to`.
* Adjuntos de archivos.
* SLA y recordatorios automáticos.
* Búsqueda avanzada y filtros guardados.
* Multi-tenant.
* Integraciones (Jira / Linear / Slack / Email) mediante Make o funciones.


## Autor

Lluís Adán — Desarrollador de automatización e internal tools
[https://linkedin.com/in/lluis-adan](https://linkedin.com/in/lluis-adan)
