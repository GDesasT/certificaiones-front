# API completa para Frontend

Esta guía recoge TODOS los endpoints de la app, con sus entradas, salidas, ejemplos y notas para integrarse desde el Front (web/tablet).

Base
- Base URL: http://localhost:8000/api
- Formato: JSON
- Autenticación: Actualmente solo GET /api/user exige token (auth:sanctum). El resto está público en este repo; si se habilita auth global, enviar siempre Authorization: Bearer <token>.
- Roles: admin, dev, trainer, mantenimiento, produccion, calidad, employee, disabled.

Autenticación
1) POST /login — Iniciar sesión (número de empleado)
- Body (una de las dos claves):
  {
    "employee_number": "A00123",
    "password": "******"
  }
  o
  {
    "number_employee": "A00123",
    "password": "******"
  }
- Respuesta 200:
  {
    "token": "...",
    "user": { "id": 1, "name": "Red", "number_employee": "A00123", "role": { "id": 5, "name": "mantenimiento" } },
    "capabilities": { "isAdmin": false, "isTrainer": false, "canApprove": true, "approveRoles": ["mantenimiento"], "canCreateCert": false, "canExport": false },
    "modules": ["aprobaciones"]
  }
- Errores: 422 (faltan campos), 401 (credenciales inválidas), 403 (disabled).

2) GET /user — Usuario autenticado
- Header: Authorization: Bearer <token>
- Respuesta 200: { "user": {...}, "capabilities": {...}, "modules": [...] }
- Errores: 401 si no hay sesión.

3) POST /logout — Cerrar sesión
- Respuesta 200: { "message": "Cierre de sesión exitoso." }

Usuarios
- Modelo Users: { id, employee_number, name, classification, position, department, area, hire_date, role_id, password }

1) GET /users — Listar (paginado)
- Query opcional: all=true (sin paginación)
- Respuesta 200: { "usuarios": [ { user+role } ] }

2) POST /users — Crear
- Body requerido: { employee_number, name, classification, position, department, area, hire_date (YYYY-MM-DD), role_id, password? }
- Respuesta 201: { message, usuario }
- Errores: 422 validación; 409 si duplicate employee_number (desde validator unique).

3) GET /users/{id} — Detalle
- Respuesta 200: { usuario }
- Errores: 404 si no existe.

4) PUT /users/{id} — Actualizar
- Body: mismos campos ("sometimes"). Password opcional; si viene, se hashea.
- Respuesta 200: { message, usuario }
- Errores: 404 si no existe; bloqueos especiales si admin (mensaje explicativo).

5) DELETE /users/{id} — Eliminar
- Respuesta 200: { message }
- Errores: 404 si no existe; bloqueos si admin.

6) GET /users/filter — Filtros básicos
- Query: role_id (o 'null'), search (name/email like)
- Respuesta 200: { usuarios: [...paginado] }

7) GET /users/by-number/{number} — Buscar por número de empleado
- Respuesta 200: { user: { id, name, employee_number } | null }

8) GET /roles — Listado de roles
- Respuesta 200: { roles: [ { id, name, description } ] }

9) POST /users/{id}/temp-password — Fijar contraseña temporal
- Respuesta 200: { message }

Áreas
1) GET /areas — Listar
- Respuesta 200: { areas: [...] } (en este repo el controller devuelve 'areas' o 'message' según acción)

2) POST /areas — Crear
- Body: { name, description? }
- Respuesta 201: { message, Área }

3) GET /areas/{id} — Detalle
- Respuesta 200: { message, area, lines: [...] }

4) PUT /areas/{id} — Actualizar
- Body: { name?, description? }
- Respuesta 200: { message, area }

5) DELETE /areas/{id} — Eliminar
- Respuesta 200: { message }

Líneas
1) GET /lines — Listar
- Respuesta 200: { lines: [...] }

2) POST /lines — Crear
- Body: { name, description?, area_id }
- Respuesta 201: { message, Line }

3) GET /lines/{id} — Detalle
- Respuesta 200: { message, line, area }

4) PUT /lines/{id} — Actualizar
- Body: campos anteriores (parciales)
- Respuesta 200: { message, line, area }

5) DELETE /lines/{id}
- Respuesta 200: { message }

Programas
1) GET /programs — Listar
- Respuesta 200: { programs: [...], message }

2) POST /programs — Crear
- Body: { name, description?, line_id }
- Respuesta 201: { message, Programa }

3) GET /programs/{id}
- Respuesta 200: { message, Programa, line }

4) PUT /programs/{id}
- Body: campos parciales
- Respuesta 200: { message, Programa }

5) DELETE /programs/{id}
- Respuesta 200: { message }

Operaciones
1) GET /operations — Listar
- Respuesta 200: { operations: [...] }

2) POST /operations — Crear
- Body: { number_operation, name, description?, programa_id }
- Respuesta 201: { message, Operation }

3) GET /operations/{id}
- Respuesta 200: { message, operation, program }

4) PUT /operations/{id}
- Body: parciales
- Respuesta 200: { message, operation }

5) DELETE /operations/{id}
- Respuesta 200: { message }

Certificaciones — Listado y filtros
1) GET /certifiers — Pagina y filtra
- Query:
  - estado: pendiente | aprobada
  - fully_approved: true|false
  - area_id, line_id, programa_id, operation_id
  - user_number (número de empleado), user_name (like), trainer_number
  - porcentaje_min, porcentaje_max
  - fecha_desde, fecha_hasta (sobre fecha_certificacion)
  - needs_role: mantenimiento | produccion | calidad (faltante de esa firma)
  - sort_by: id|fecha_certificacion|fecha_emision|porcentaje; sort_dir: asc|desc
  - per_page (1..100), page
- Respuesta 200:
  { data: [ { certificación con relaciones } ], meta: { current_page, per_page, total, last_page, sort_by, sort_dir, applied_filters } }

2) GET /certifiers/pending?role={rol}
- role: mantenimiento | produccion | calidad
- Respuesta 200: igual al listado

Certificaciones — CRUD y helpers
3) POST /certifiers — Crear
- Body:
  { employee_number, trainer_employee_number, operation_id, porcentaje (0..100), fecha_certificacion (date), notas? }
- Respuesta 201: { message, certifier, user: { id, name, employee_number } }
- 409 si ya existe (user_id, operation_id)

4) GET /certifiers/{id}
- Respuesta 200: { message, certifier }

5) DELETE /certifiers/{id}
- Respuesta 200: { message }

6) GET /certifiers-by-employee/{employee_number}
- Respuesta 200: { message, user: { ... }, certificaciones: [...] }

7) GET /certifiers-by-program/{program_id}
- Respuesta 200: { message, certificaciones }

8) GET /certifiers-with-users
- Respuesta 200: { message, certificaciones }

9) GET /certifiers/by-area
- Respuesta 200: { certificaciones } (en este repo no retorna explícitamente, endpoint usado para pruebas)

10) PUT /certifiers/update-percent
- Body (dos variantes):
  - { id, porcentaje }
  - { employee_number, operation_id, porcentaje }
- Respuesta 200: { message, certificacion }

Aprobaciones (firmas)
1) POST /certifiers/approve — Registrar firma
- Body:
  { certificacion_id, approver_qr? (string), approver_number? (string), approver_role (mantenimiento|produccion|calidad), source?, notes? }
- Reglas: se permite QR ; no duplicar rol; al completar las 3 firmas → estado=aprobada y fecha_emision.
- Respuesta 201: { message, certificacion, approval }

2) POST /certifiers/revoke — Revocar firma por rol
- Body: { certificacion_id, approver_role }
- Respuesta 200: { message, certificacion } (si falta alguna firma → estado=pendiente y limpia fecha_emision)

3) GET /certifiers/resolve-approver — Resolver QR/número para tablets
- Query: code (texto QR o número), approver_role?, certificacion_id?
- Respuesta 200:
  { user: { id, name, employee_number, role }, eligible_roles: [...], canApprove: bool, alreadyApproved: bool, reason: string|null, next: { method, url, bodyExample } }

Exportación
- GET /certifiers/export/excel — Exporta a .xlsx
- Query: mismos filtros del listado (estado, fully_approved, ids, user_name/number, porcentaje_min/max, fechas, needs_role)

Flujo en sitio con QR (tablets)
- Objetivo: crear certificación y recabar 3 firmas en la misma sesión.
- Pasos sugeridos:
  1) POST /certifiers para crear.
  2) Para cada firma (mantenimiento/produccion/calidad): escanear QR (contenido = employee_number) → opcional GET resolve-approver → POST approve con approver_qr.
  3) Al firmar la tercera, backend marca estado=aprobada y fecha_emision.
  4) GET /certifiers/{id} para refrescar y mostrar emitida.
- Sin expiraciones por tiempo en el backend.

Scopes de aprobación (opcional)
1) GET /approval-scopes — Listar
- Query: user_id?, user_number?, role?, area_id?, line_id?, programa_id?
- Respuesta 200: { scopes: [...] }

2) POST /approval-scopes — Crear
- Body: { user_number? | user_id?, role (mantenimiento|produccion|calidad), area_id?, line_id?, programa_id? }
- Respuesta 201: { message, scope }
- Errores: 422 validación; 409 si scope duplicado.

3) DELETE /approval-scopes/{id}
- Respuesta 200: { message }

Notas finales
- Mensajes en español.
- Si en producción se protege todo con auth, el Front debe enviar Authorization: Bearer <token> en todas las llamadas.
- Para tablets, el QR debe contener exactamente el employee_number.
