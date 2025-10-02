# API Certificaciones y Aprobaciones

Este documento describe los endpoints disponibles para gestionar certificaciones, actualizaciones de porcentaje y el flujo de aprobaciones por roles (mantenimiento, producción, calidad).

## Convenciones generales
- Respuestas en JSON.
- Códigos de estado coherentes: 200/201 éxito, 404 no encontrado, 409 conflicto (duplicado), 422 validación, 403 no autorizado si aplica.
- Las certificaciones incluyen relaciones relevantes: user, trainer, operation, programa, line, area, aprobaciones (con approver y approverRole) y el campo calculado `approved_status`.

`approved_status` ejemplo:
```json
{
  "mantenimiento": true,
  "produccion": false,
  "calidad": true,
  "fullyApproved": false
}
```

---

## Base
- Base URL local: `http://localhost:8000/api`
- Autenticación: actualmente los endpoints de certificaciones están públicos (sin middleware). Si se protege con `auth:sanctum`, enviar token en `Authorization: Bearer <token>`.

## Estructura de datos (resumen)
Objeto Certificación (resumen de campos más usados en el front):
```json
{
  "id": 123,
  "user_id": 10,
  "trainer_id": 7,
  "operation_id": 55,
  "programa_id": 9,
  "line_id": 4,
  "area_id": 2,
  "porcentaje": "80.00",
  "fecha_certificacion": "2025-09-22T00:00:00.000000Z",
  "estado": "pendiente", // o "aprobada" cuando tiene 3 firmas
  "fecha_emision": null,
  "notas": null,
  "approved_status": {
    "mantenimiento": false,
    "produccion": false,
    "calidad": true,
    "fullyApproved": false
  },
  "user": { "id": 10, "name": "Juan", "number_employee": "A00123", "email": "juan@acme.com", "date_of_admission": "2024-01-10" },
  "trainer": { "id": 7, "name": "Ana", "number_employee": "T0007" },
  "operation": { "id": 55, "name": "Soldadura 1" },
  "programa": { "id": 9, "name": "Programa A" },
  "line": { "id": 4, "name": "Línea 4" },
  "area": { "id": 2, "name": "Área Metal" },
  "aprobaciones": [
    {
      "id": 1,
      "approver": { "id": 21, "name": "Carlos", "number_employee": "M012" },
      "approverRole": { "id": 5, "name": "mantenimiento" },
      "approved_at": "2025-09-24T12:00:00.000000Z",
      "source": "keyfob",
      "notes": null
    }
  ]
}
```

Notas rápidas para UI:
- Mostrar avance con `approved_status`.
- Considerar "emitida" (lista para descargar/imprimir) cuando `estado = "aprobada"` y `fecha_emision` tenga valor.

## Certificaciones

### GET /api/certifiers
Lista certificaciones con filtros y paginación.

Query params (opcionales):
- estado: pendiente | aprobada
- fully_approved: true | false
- area_id, line_id, programa_id, operation_id
- user_number (número de empleado), user_name (like), trainer_number
- porcentaje_min, porcentaje_max
- fecha_desde, fecha_hasta (sobre fecha_certificacion)
- needs_role: mantenimiento | produccion | calidad (certificaciones que aún NO tienen esa firma)
- sort_by: id | fecha_certificacion | fecha_emision | porcentaje (default id)
- sort_dir: asc | desc (default desc)
- per_page: 1..100 (default 15)
- page: default 1

Respuesta:
```json
{
  "data": [ { /* certificación */ } ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 120,
    "last_page": 8,
    "sort_by": "id",
    "sort_dir": "desc",
    "applied_filters": { /* filtros aplicados */ }
  }
}
```

Ejemplos de uso:
- Pendientes por producción con 20 por página: `/api/certifiers?needs_role=produccion&per_page=20`
- Por programa y fecha: `/api/certifiers?programa_id=9&fecha_desde=2025-01-01&fecha_hasta=2025-12-31`

### GET /api/certifiers/pending?role={rol}
Certificaciones pendientes de una firma específica.
- role: mantenimiento | produccion | calidad

Respuesta: igual a GET /api/certifiers.

### POST /api/certifiers
Crea una certificación.

Body:
- number_employee (string; requerido)
- trainer_number_employee (string; requerido)
- operation_id (int; requerido)
- porcentaje (0..100; requerido)
- fecha_certificacion (date; requerido)
- notas (string; opcional)

Errores comunes:
- 409 si ya existe certificación para (user_id, operation_id).

Respuesta (201):
```json
{
  "message": "Certificación creada correctamente.",
  "certifier": { /* certificación creada */ },
  "user": { "id": 10, "name": "Juan", "number_employee": "A00123", "email": "juan@acme.com" }
}
```

### GET /api/certifiers/{id}
Detalle de certificación.

### DELETE /api/certifiers/{id}
Elimina certificación.

### GET /api/certifiers-by-employee/{number_employee}
Lista certificaciones de un empleado.

### GET /api/certifiers-by-program/{program_id}
Lista certificaciones por programa.

### GET /api/certifiers-with-users
Lista certificaciones con datos de usuario.

### GET /api/certifiers/by-area
Lista certificaciones por área.

### PUT /api/certifiers/update-percent
Actualiza porcentaje de una certificación.

Body (dos variantes):
- { id, porcentaje }
- { number_employee, operation_id, porcentaje }

Respuesta (200):
```json
{ "message": "Porcentaje actualizado correctamente", "certificacion": { /* certificación */ } }
```

---

## Aprobaciones (Firmas)

### POST /api/certifiers/approve
Registra una aprobación por rol.

Body:
- certificacion_id (int; requerido)
- approver_number (string; requerido sin approver_qr; número de empleado)
- approver_qr (string; requerido sin approver_number; contenido del QR, recomendado: el propio número de empleado)
- approver_role (string; requerido; mantenimiento | produccion | calidad)
- source (string; opcional; default "keyfob"; si se usa approver_qr se registra como "qr")
- notes (string; opcional)

Reglas:
- Solo roles mantenimiento, producción o calidad pueden aprobar.
- No se permite la firma duplicada del mismo rol por certificación.
- Al completar las tres firmas, la certificación pasa a estado "aprobada" y se asigna `fecha_emision`.

Respuesta (201):
```json
{ "message": "Aprobación registrada correctamente", "certificacion": { /* actualización */ }, "approval": { /* aprobación creada */ } }
```

### POST /api/certifiers/revoke
Revoca una aprobación para un rol.

Body:
- certificacion_id (int; requerido)
- approver_role (string; requerido; mantenimiento | produccion | calidad)

Reglas:
- Si falta alguna de las tres firmas, la certificación vuelve a estado "pendiente" y se elimina `fecha_emision`.

Respuesta (200):
```json
{ "message": "Aprobación revocada correctamente", "certificacion": { /* certificación actualizada */ } }
```

---

## Flujo con QR en tablets

Objetivo: Permitir firmar escaneando un QR en el gafete. El QR contiene el número de empleado (sugerido: exactamente el campo `number_employee`).

Formato recomendado del QR:
- Contenido: el `number_employee` tal cual (ej. `M0123`).
- Evitar prefijos o JSON para simplicidad en la tablet. Si deseas un formato más rico, soportamos cualquier string siempre que sea exactamente el número en este backend.

Pasos sugeridos del Front (tablets):
1) Escanear QR con la cámara y obtener el texto (`code`).
2) (Opcional) Validar el QR antes de firmar: GET `/api/certifiers/resolve-approver?code={textoQR}&approver_role={rol}&certificacion_id={id}`. Esto devuelve identidad, rol y si puede firmar o si ya existe la firma de ese rol.
3) Si `canApprove = true`, enviar la firma: POST `/api/certifiers/approve` con `{ certificacion_id, approver_qr: code, approver_role }`.

### Operación en sitio (todo en el momento, sin pendientes)
- La certificación se crea y se recaba el 100% de las firmas en la misma sesión en piso con la tablet.
- Este backend NO impone expiraciones, ventanas de tiempo ni "caducidad" de firmas. Si la tablet o la página se recarga, simplemente vuelve a consultar la certificación por id y continúa; no se invalidan por tiempo.
- No se guarda un "pendiente" programado: la lógica asume que la certificación se completa ahí mismo. Si falta alguna firma, la certificación permanece en estado `pendiente` y no se emite hasta lograr las 3.

Ejemplo de flujo lineal en sitio:
1) Crear certificación: POST `/api/certifiers` con `{ number_employee, trainer_number_employee, operation_id, porcentaje, fecha_certificacion }`.
2) Firmas en secuencia (cualquier orden): para cada rol [mantenimiento, produccion, calidad]
  - Escanear QR del aprobador → `code`.
  - (Opcional) GET `/api/certifiers/resolve-approver?code=...&approver_role={rol}&certificacion_id={id}`.
  - POST `/api/certifiers/approve` con `{ certificacion_id, approver_qr: code, approver_role: '{rol}' }`.
3) Al registrar la tercera firma, el backend marca `estado = 'aprobada'` y asigna `fecha_emision`.
4) UI puede refrescar el detalle con GET `/api/certifiers/{id}` para mostrarla como emitida.

#### Ejemplos (mock) de respuestas
1) POST /api/certifiers (crear)
```json
{
  "message": "Certificación creada correctamente.",
  "certifier": {
    "id": 101,
    "user_id": 10,
    "trainer_id": 7,
    "operation_id": 55,
    "programa_id": 9,
    "line_id": 4,
    "area_id": 2,
    "porcentaje": "80.00",
    "fecha_certificacion": "2025-09-25T00:00:00.000000Z",
    "estado": "pendiente",
    "fecha_emision": null
  },
  "user": { "id": 10, "name": "Juan", "number_employee": "A00123", "email": "juan@acme.com" }
}
```

2) GET /api/certifiers/resolve-approver?code=M012&approver_role=mantenimiento&certificacion_id=101
```json
{
  "user": { "id": 21, "name": "Carlos", "number_employee": "M012", "role": "mantenimiento" },
  "eligible_roles": ["mantenimiento"],
  "canApprove": true,
  "alreadyApproved": false,
  "reason": null,
  "next": {
    "method": "POST",
    "url": "http://localhost:8000/api/certifiers/approve",
    "bodyExample": { "certificacion_id": 101, "approver_qr": "M012", "approver_role": "mantenimiento" }
  }
}
```

3) POST /api/certifiers/approve (primera o segunda firma)
```json
{
  "message": "Aprobación registrada correctamente",
  "certificacion": {
    "id": 101,
    "estado": "pendiente",
    "fecha_emision": null,
    "aprobaciones": [
      { "approverRole": { "name": "mantenimiento" }, "approved_at": "2025-09-25T12:00:00.000000Z" }
    ]
  },
  "approval": { "id": 501, "source": "qr" }
}
```

4) POST /api/certifiers/approve (tercera firma)
```json
{
  "message": "Aprobación registrada correctamente",
  "certificacion": {
    "id": 101,
    "estado": "aprobada",
    "fecha_emision": "2025-09-25T12:05:12.000000Z",
    "aprobaciones": [
      { "approverRole": { "name": "mantenimiento" } },
      { "approverRole": { "name": "produccion" } },
      { "approverRole": { "name": "calidad" } }
    ]
  },
  "approval": { "id": 503, "source": "qr" }
}
```

5) GET /api/certifiers/{id} (detalle emitido)
```json
{
  "message": "Certificación obtenida correctamente",
  "certifier": {
    "id": 101,
    "estado": "aprobada",
    "fecha_emision": "2025-09-25T12:05:12.000000Z",
    "approved_status": { "mantenimiento": true, "produccion": true, "calidad": true, "fullyApproved": true }
  }
}
```

### GET /api/certifiers/resolve-approver
Permite resolver el QR/número y saber si el usuario puede firmar para una certificación.

Query params:
- code (string; requerido): texto del QR o número de empleado.
- approver_role (string; opcional): mantenimiento | produccion | calidad. Si lo envías, validamos que el rol del usuario coincida.
- certificacion_id (int; opcional): si lo envías, indicamos si ya existe la firma de ese rol en esa certificación.

Respuesta (200):
```json
{
  "user": { "id": 21, "name": "Carlos", "number_employee": "M012", "role": "mantenimiento" },
  "eligible_roles": ["mantenimiento"],
  "canApprove": true,
  "alreadyApproved": false,
  "reason": null,
  "next": {
    "method": "POST",
    "url": "http://localhost:8000/api/certifiers/approve",
    "bodyExample": { "certificacion_id": 123, "approver_qr": "M012", "approver_role": "mantenimiento" }
  }
}
```

Notas de UX y seguridad:
- Este backend acepta `approver_qr` como alias de `approver_number` y lo registra con `source="qr"` automáticamente.
- Cualquier usuario con rol mantenimiento/producción/calidad puede firmar (no hay restricciones por alcance en esta versión).
- El front debe mostrar el nombre y rol resueltos antes de firmar para evitar errores humanos.
- Si se desea robustez adicional, el QR podría incluir un checksum simple; como no se especificó, se usa el valor literal del número de empleado.
 - No hay validaciones por tiempo: el backend no expira firmas ni sesiones para este flujo.

### Guía rápida de pantallas (tablets)
- Pantalla 1: Crear certificación
  - Form: número de empleado, entrenador, operación, porcentaje, fecha.
  - Acción: Crear → Navega a detalle con `id`.
- Pantalla 2: Firmas (detalle de certificación)
  - Muestra estado, porcentaje, operación y `approved_status` con 3 chips (mantenimiento/producción/calidad).
  - Botón “Escanear QR” → abre cámara, obtiene `code`.
  - Opcional: valida con `resolve-approver`; muestra nombre y rol.
  - Acción: Firmar → POST approve. Actualiza chips en vivo.
  - Al completar las 3 firmas: resalta “Emitida” y muestra `fecha_emision`.
- Pantalla 3: Confirmación/Impresión
  - Botón “Finalizar” o “Descargar/Imprimir” (si aplica en tu front), y botón “Nueva certificación”.

---

## Exportar a Excel

### GET /api/certifiers/export/excel
Descarga un .xlsx con las certificaciones visibles según filtros. Columnas incluidas:
- Empleado, Número Empleado, Operación, Fecha de Admisión, Fecha Certificación, Porcentaje (formato %)

Query params (opcionales, compatibles con listado):
- estado (pendiente|aprobada), fully_approved
- area_id, line_id, programa_id, operation_id
- user_number, user_name
- porcentaje_min, porcentaje_max
- fecha_desde, fecha_hasta (sobre fecha_certificacion)
- needs_role: mantenimiento | produccion | calidad

Ejemplos:
- `/api/certifiers/export/excel?estado=aprobada&programa_id=9`
- `/api/certifiers/export/excel?user_number=A00123&fecha_desde=2025-01-01&fecha_hasta=2025-12-31`

---

## Códigos de error y mensajes
- 422: errores de validación (campos faltantes o inválidos).
- 404: recursos no encontrados (certificación/usuario/operación inexistente).
- 409: conflicto por duplicidad (ya existe firma de ese rol o certificación duplicada por usuario+operación).
- 403: rol no permitido para aprobar (si aplica).

---

## Notas
- Las firmas se registran en `certificacion_aprobaciones` y se devuelven con `aprobaciones.approver` y `aprobaciones.approverRole`.
- El atributo `approved_status` facilita la UI para mostrar el avance de firmas.
- `estado` y `fecha_emision` reflejan la emisión real del certificado (requiere las tres firmas).
 - El endpoint de export usa los mismos filtros del listado para evitar duplicar lógica en el front.
