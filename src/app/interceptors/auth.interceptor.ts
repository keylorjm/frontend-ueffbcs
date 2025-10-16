// src/app/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
// 🛑 CORRECCIÓN CLAVE: Importamos el servicio y la constante TOKEN_KEY
import { AuthService, TOKEN_KEY } from '../services/auth.service'; 
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 🛑 CORRECCIÓN: Usamos la constante TOKEN_KEY ('auth_token') para leer el token.
  const token = localStorage.getItem(TOKEN_KEY); 
  
  let clonedRequest = req;

  // 1. Adjuntar el Token a la Petición
  if (token) {
    clonedRequest = req.clone({
      // El formato 'Bearer ' es correcto.
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // 2. Manejo de Errores (Correcto para el 401)
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401) {
        console.warn('⚠️ Token expirado o no autorizado. Limpiando sesión.');
        
        authService.logout(); 
        router.navigate(['/login']); 
      }

      return throwError(() => error);
    })
  );
};