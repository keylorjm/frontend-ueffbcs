// src/app/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Export para reusar en interceptor
export const TOKEN_KEY = 'auth_token';

// Tipos
export interface AuthResponse {
  success: boolean;
  token: string;
  datos: {
    id: string;
    nombre: string;
    rol: 'admin' | 'profesor';
  };
}
export interface UserCredentials {
  correo: string;
  clave: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  // 👇 SSR-safe: detecta plataforma
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // 👇 NO leer localStorage al construir (SSR)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Solo en navegador, inicializa estado real
    if (this.isBrowser) {
      this.isAuthenticatedSubject.next(this.checkToken());
    }
  }

  // --- Helpers de Estado ---

  private checkToken(): boolean {
    if (!this.isBrowser) return false; // SSR: no hay localStorage
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // --- Flujo de Autenticación ---

  login(credenciales: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/autenticacion/iniciarSesion`, credenciales)
      .pipe(
        tap((res) => {
          if (res.success && res.token) {
            if (this.isBrowser) {
              localStorage.setItem(TOKEN_KEY, res.token);
            }
            this.isAuthenticatedSubject.next(true);
            // Navegar solo en navegador
            if (this.isBrowser) {
              this.router.navigate(['/app/usuarios']);
            }
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.isAuthenticatedSubject.next(false);
    if (this.isBrowser) {
      this.router.navigate(['/login']);
    }
  }

  recuperarContrasena(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/autenticacion/recuperarContrasena`, { correo });
  }

  restablecerContrasena(token: string, clave: string): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${this.apiUrl}/autenticacion/restablecerContrasena/${token}`, { clave })
      .pipe(
        tap((res) => {
          if (res.success && res.token) {
            if (this.isBrowser) {
              localStorage.setItem(TOKEN_KEY, res.token);
            }
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }
}
