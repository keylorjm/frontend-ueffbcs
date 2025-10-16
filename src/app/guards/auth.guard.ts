// src/app/guards/auth.guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // El Guardián debe usar el Observable para esperar el estado inicial.
  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Token encontrado y válido
      } else {
        // Redirigir al login si no está autenticado
        router.navigate(['/login']);
        return false;
      }
    })
  );
};