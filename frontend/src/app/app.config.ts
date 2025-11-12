// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

// Importa tus rutas correctamente según tu estructura de carpetas
import { routes } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),  // Manejo global de errores
    provideZonelessChangeDetection(),      // Detecta cambios sin zone.js
    provideRouter(routes),                  // Rutas de la app
  provideHttpClient(),                    // Proveedor de HttpClient para servicios
    provideClientHydration(withEventReplay()) // Hydration en SSR
  ]
};
