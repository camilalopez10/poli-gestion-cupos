import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Usar `appConfig` que ya provee rutas y otras configuraciones (SSR tiene su propia variante en main.server.ts)
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
