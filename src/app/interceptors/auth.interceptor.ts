// src/app/interceptors/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

// ✅ Importa tu servicio y la clave del token
import { AuthService, TOKEN_KEY } from '../services/auth.service';
import { environment } from '../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ SSR-safe: sólo acceder a localStorage en navegador
  const isBrowser = typeof window !== 'undefined';

  // ✅ Normaliza base de API (sin slash final)
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, '');
  const isApiCall = apiBase && req.url.startsWith(apiBase);

  // ✅ No adjuntar token en el endpoint de login
  const isLoginCall = isApiCall && req.url === `${apiBase}/autenticacion/iniciarSesion`;

  let request = req;

  // 1) Adjuntar token SÓLO a llamadas a tu API (excepto login) y si no existe ya un Authorization
  if (isBrowser && isApiCall && !isLoginCall && !req.headers.has('Authorization')) {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        request = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignorar errores de acceso a localStorage
    }
  }

  // 2) Manejo de errores comunes (401)
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isBrowser) {
        // Token inválido/expirado → cerrar sesión; tu logout ya navega a /login
        authService.logout();
        // Si preferiste returnUrl, podrías usar:
        // const returnUrl = router?.url ?? '/';
        // router.navigate(['/login'], { queryParams: { returnUrl } });
      }
      return throwError(() => error);
    })
  );
};
