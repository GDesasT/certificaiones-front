# Proceso de Certificación (Guía para Frontend)

Esta guía describe el flujo completo para crear una certificación y recolectar las firmas de producción, calidad y mantenimiento hasta dejarla emitida.

Resumen del flujo
1) Captura de datos y creación de la certificación
2) Recolección de firmas (3 roles): mantenimiento, producción y calidad
3) Emisión automática al completar las 3 firmas

Precondiciones
- El empleado a certificar y el entrenador existen en el sistema con su `employee_number`.
- La operación pertenece a un programa, que pertenece a una línea, que pertenece a un área (ya configurados).
- Las personas que firman (mantenimiento/producción/calidad) tienen su rol asignado.

1) Crear certificación
- Endpoint: POST /api/certifiers
- Body requerido:
  {
    "employee_number": "A00123",               // a quién certificas
    "trainer_employee_number": "T0007",        // el que certifica (debe tener rol trainer)
    "operation_id": 55,                         // operación donde se certifica
    "porcentaje": 80,                           // 0..100
    "fecha_certificacion": "2025-10-01",       // YYYY-MM-DD
    "notas": "opcional"                        // string
  }
- Comportamiento:
  - El backend deriva y guarda programa_id, line_id, area_id desde la operación.
  - Rechaza duplicados por (user_id, operation_id).
- Respuesta (201):
  {
    "message": "Certificación creada correctamente.",
    "certifier": { "id": 101, "estado": "pendiente", ... },
    "user": { "id": 10, "name": "Juan", "employee_number": "A00123" }
  }

2) Recolección de firmas (en sitio)
- Objetivo: obtener 3 firmas en cualquier orden: mantenimiento, producción, calidad.
- Cada firma puede hacerse con:
  a) QR (recomendado para tablets): el QR contiene `employee_number` del aprobador.
  b) Número de empleado ingresado manualmente.

Opcional: Validar QR antes de firmar
- Endpoint: GET /api/certifiers/resolve-approver
- Query: ?code={textoQR_o_numero}&approver_role={rol?}&certificacion_id={id?}
- Respuesta (200):
  {
    "user": { "id": 21, "name": "Carlos", "employee_number": "M012", "role": "mantenimiento" },
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

Registrar una firma
- Endpoint: POST /api/certifiers/approve
- Body (pasando QR o número):
  {
    "certificacion_id": 101,
    "approver_qr": "M012",                 // contenido QR (employee_number)
    "approver_role": "mantenimiento",
    "notes": "opcional"
  }
  o
  {
    "certificacion_id": 101,
    "approver_number": "M012",             // número de empleado manual
    "approver_role": "mantenimiento",
    "notes": "opcional"
  }
- Reglas:
  - El usuario firmante debe tener el rol indicado (mantenimiento/producción/calidad).
  - No se permite duplicar la firma del mismo rol para esa certificación.
  - Sin expiraciones de tiempo: se asume flujo en sitio.
- Respuesta (201): { "message": "Aprobación registrada correctamente", "certificacion": { ... }, "approval": { ... } }

3) Emisión automática
- Al registrar la tercera firma (las tres distintas), el backend cambia:
  - estado = "aprobada"
  - fecha_emision = now()
- Puedes refrescar:
  - GET /api/certifiers/{id}
  - Recibirás la certificación con `estado="aprobada"` y `approved_status` con los tres roles en true.

Firmantes por rol (qué devuelve el backend)
- En las respuestas de detalle/listado ya se incluyen las firmas con el usuario firmante y su rol:
  - Campo: `aprobaciones[]` con relaciones `approver` (User) y `approverRole` (Role).
- Ejemplo (fragmento de GET /api/certifiers/{id}):
```json
{
  "certifier": {
    "id": 101,
    "estado": "aprobada",
    "aprobaciones": [
      {
        "id": 501,
        "approved_at": "2025-10-02T12:00:00.000000Z",
        "approver": { "id": 21, "name": "Carlos Pérez", "employee_number": "M012" },
        "approverRole": { "id": 5, "name": "mantenimiento" },
        "source": "qr",
        "notes": null
      },
      {
        "id": 502,
        "approved_at": "2025-10-02T12:02:13.000000Z",
        "approver": { "id": 31, "name": "Laura Gómez", "employee_number": "P034" },
        "approverRole": { "id": 6, "name": "produccion" },
        "source": "qr",
        "notes": null
      },
      {
        "id": 503,
        "approved_at": "2025-10-02T12:05:12.000000Z",
        "approver": { "id": 41, "name": "Sofía Ruiz", "employee_number": "C021" },
        "approverRole": { "id": 7, "name": "calidad" },
        "source": "qr",
        "notes": null
      }
    ]
  }
}
```
- Con esto el Front puede mostrar fácilmente el nombre y número de empleado de cada firma por rol.

Campos y relaciones de la certificación
- Guardados al crear:
  - user_id (derivado de employee_number)
  - trainer_id (derivado de trainer_employee_number)
  - operation_id (del request)
  - programa_id, line_id, area_id (derivados de operation_id)
  - porcentaje, fecha_certificacion, notas
  - estado = "pendiente" (hasta completar 3 firmas)
- Calculados/actualizados:
  - fecha_emision (al completar 3 firmas y emitir)
  - approved_status (mantenimiento/producción/calidad y fullyApproved)

Buenas prácticas de UI (tablets)
- Mostrar chips/indicadores para los 3 roles con estado de firma.
- Botón "Escanear QR" para abrir cámara y leer `code`.
- Validar opcional con `resolve-approver` antes de firmar para evitar errores.
- Al completar las 3 firmas, destacar "Emitida" y mostrar `fecha_emision`.
- Botón "Nueva certificación" al finalizar.

Errores comunes
- 409 al crear: ya existe certificación (user + operation)
- 409 al firmar: ya existe firma de ese rol
- 403 al firmar: el usuario no tiene un rol válido para aprobar
- 404: usuario/certificación/operación no encontrada
- 422: errores de validación

Referencias
- Listado y filtros de certificaciones: GET /api/certifiers
- Exportación a Excel: GET /api/certifiers/export/excel (mismos filtros que listado)
- Guías relacionadas: docs/api-certificaciones.md, docs/api-frontend.md
