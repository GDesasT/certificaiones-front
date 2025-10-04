# ProyectoCertificaciones

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Aplicación de escritorio (Electron)

Desarrollo (abre Electron y apunta al `ng serve`):

```bash
npm run electron:dev
```

Compilar y empaquetar la app de escritorio (Windows/macOS/Linux):

```bash
npm run electron:build
```

Los artefactos quedarán en `release/`. En macOS se generan `.dmg/.zip`, en Windows `NSIS/portable`, y en Linux `AppImage/deb/rpm`.

Notas:
- El escáner QR funciona en Electron (Chromium) con `getUserMedia`. En macOS/Windows, el sistema pedirá permisos de cámara la primera vez.
- Si interceptas permisos con `session.setPermissionRequestHandler`, ya está configurado para permitir `media` (cámara).
- Android no es plataforma objetivo de Electron. Para móvil usa PWA + HTTPS o Capacitor/Cordova.
## App móvil (Capacitor)

Build y sincronización:

```bash
npm run cap:build       # Compila Angular y copia web assets
npm run cap:sync        # Compila Angular y sincroniza plataformas
npm run cap:open:android
# En macOS
npm run cap:open:ios
```

Permisos y red:
- Android: se añadieron permisos de INTERNET y CAMERA; se configuró `usesCleartextTraffic` y Network Security Config para permitir HTTP a `localhost`, `10.0.2.2` y `172.20.10.13` (solo desarrollo). Para producción, usar HTTPS.
- iOS: añade NSCameraUsageDescription (ya declarado) y requiere Xcode/CocoaPods para instalar dependencias nativas.

Notas:
- El escáner QR funciona en WebView nativo usando getUserMedia. En emuladores sin cámara, prueba en dispositivo físico.
- Si cambias la IP de la API, actualiza `environment.ts` y, si usas HTTP plano, agrega el dominio/IP en `android/app/src/main/res/xml/network_security_config.xml`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
