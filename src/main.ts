//=================[Importaciones]=========
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

//=================[Bootstrap de la Aplicación]=========
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
