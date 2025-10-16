// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, BehaviorSubject, of, catchError, map } from 'rxjs';
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

// Usuario actual (perfil) obtenido del backend
export interface CurrentUser {
  id: string;
  nombre: string;
  rol: 'admin' | 'profesor' | string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  // 👇 SSR-safe: detecta plataforma
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Estado de autenticación (solo booleano)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Estado del usuario actual (perfil con rol)
  private _userSubject = new BehaviorSubject<CurrentUser | null>(null);
  user$ = this._userSubject.asObservable();

  constructor() {
    // Solo en navegador, inicializa estado real
    if (this.isBrowser) {
      const hasToken = this.checkToken();
      this.isAuthenticatedSubject.next(hasToken);
      // Si hay token al recargar, intenta cargar el usuario
      if (hasToken) {
        this.fetchCurrentUser().subscribe();
      }
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

  get user(): CurrentUser | null {
    return this._userSubject.value;
  }

  get role(): string | null {
    return this._userSubject.value?.rol ?? null;
  }

  get isProfesor(): boolean {
    return (this.role ?? '').toLowerCase() === 'profesor';
  }
  get isAdmin(): boolean {
    return (this.role ?? '').toLowerCase() === 'admin';
  }

  // --- Flujo de Autenticación ---

  login(credenciales: UserCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/autenticacion/iniciarSesion`, credenciales)
      .pipe(
        tap((res) => {
          if (res?.success && res?.token && this.isBrowser) {
            localStorage.setItem(TOKEN_KEY, res.token);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        // Cargar usuario y recién entonces navegar según rol
        switchMap((res) => {
          if (!res?.success) return of(res);
          return this.fetchCurrentUser().pipe(
            tap((u) => {
              if (!this.isBrowser) return;
              const rol = (u?.rol ?? '').toLowerCase();
              if (rol === 'profesor') {
                this.router.navigate(['/app/profesor/mis-cursos']);
              } else {
                // tu ruta original
                this.router.navigate(['/app/usuarios']);
              }
            }),
            map(() => res)
          );
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.isAuthenticatedSubject.next(false);
    this._userSubject.next(null);
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
            // tras restablecer, refrescamos usuario por si el backend lo permite
            this.fetchCurrentUser().subscribe();
          }
        })
      );
  }

  /**
   * Obtiene el usuario actual desde el backend (incluye rol).
   * ⚠️ Ajusta el endpoint si en tu backend se llama distinto.
   * Ejemplos comunes: /usuarios/me, /autenticacion/usuario, /auth/me
   */
  fetchCurrentUser(): Observable<CurrentUser | null> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/`).pipe(
      mapToCurrentUser(),
      tap((u) => this._userSubject.next(u)),
      catchError((_err) => {
        // Si falla (token inválido, etc.), limpiamos estado
        this._userSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Asegura que haya usuario cargado en memoria si existe token (para guards).
   */
  ensureUserLoaded(): Observable<boolean> {
    // Si ya tenemos usuario o no hay token, resolvemos rápido
    if (this._userSubject.value) return of(true);
    if (!this.checkToken()) return of(false);
    // Intentamos cargar desde API
    return this.fetchCurrentUser().pipe(map((u) => !!u));
  }
}

/** Helper para mapear la respuesta del backend al modelo CurrentUser */
function mapToCurrentUser() {
  return map((raw: any): CurrentUser => {
    return {
      id: raw?.id ?? raw?._id ?? raw?.uid ?? '',
      nombre: raw?.nombre ?? raw?.name ?? '',
      rol: raw?.rol ?? raw?.role ?? '',
      email: raw?.email ?? raw?.correo,
    };
  });
}
