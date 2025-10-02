# Autenticación y roles (Front)

Esta guía describe cómo el Front debe autenticarse y adaptar la UI según los roles (admin, dev, trainer, mantenimiento, produccion, calidad, employee, disabled).

Base URL: http://localhost:8000/api

Flujo de autenticación
1) Login
- Endpoint: POST /api/login
- Body:
  {
    "email": "user@acme.com",
    "password": "******"
  }
- Respuesta (200):
  {
    "token": "...",
    "user": {
      "id": 1,
      "name": "Red",
      "email": "user@acme.com",
      "number_employee": "A00123",
      "role": { "id": 5, "name": "mantenimiento" }
    },
    "capabilities": {
      "isAdmin": false,
      "isTrainer": false,
      "canApprove": true,
      "approveRoles": ["mantenimiento"],
      "canCreateCert": false,
      "canExport": false
    },
    "modules": ["aprobaciones"]
  }
- Errores:
  - 401 Credenciales inválidas.
  - 403 Usuario deshabilitado (role = disabled).

2) Guardar token
- El Front debe guardar el token (localStorage/secure store) y enviarlo en Authorization: Bearer <token> para endpoints protegidos (si aplica).

3) Obtener usuario autenticado
- Endpoint: GET /api/user (con header Authorization)
- Respuesta (200):
  {
    "user": { ... },
    "capabilities": { ... },
    "modules": [ ... ]
  }
- Errores:
  - 401 No has iniciado sesión.

Roles y capacidades
- admin/dev:
  - Módulos: usuarios, áreas, líneas, programas, operaciones, certificaciones, aprobaciones, export.
  - Puede crear certificaciones y exportar.
- trainer:
  - Módulos: certificaciones (crear), aprobaciones (ver proceso en sitio).
  - Puede crear certificaciones.
- mantenimiento/produccion/calidad:
  - Módulo principal: aprobaciones (firmar con QR o número de empleado).
  - Puede aprobar certificaciones.
- employee:
  - Módulo principal: certificaciones (visualización).
- disabled:
  - No puede autenticarse (403 en login).

Adaptación de UI sugerida
- Usar `modules` para mostrar el menú.
- Usar `capabilities` para habilitar/deshabilitar acciones (crear, aprobar, exportar).
- En tablets:
  - Si `canApprove = true`, mostrar la vista de firmas con escaneo QR.
  - Si `isTrainer`, mostrar formulario de creación y flujo de firmas.

Notas
- Los endpoints de certificaciones actualmente no están protegido por token en este repo; si se habilita auth, enviar el Bearer en todas las llamadas.
- `number_employee` puede venir de `employee_number` para compatibilidad; el backend normaliza en la respuesta.
- Mensajes de errores están en español.
