import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

/**
 * Initializes the global Angular execution context and bootstraps the primary application root component.
 * Injects core dependency providers, establishes the root routing matrix, and mounts the
 * standalone component tree to the primary DOM boundary.
 *
 * Intercepts and logs structural initialization faults during the asynchronous mounting sequence
 * to prevent silent runtime execution failures.
 */
bootstrapApplication(App, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));
