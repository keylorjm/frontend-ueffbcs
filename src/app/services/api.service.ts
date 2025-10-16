// src/app/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // 💡 Asegúrate de que esta URL base sea correcta (ej: tu servidor de Express)
  private readonly baseUrl = 'http://localhost:5000/api'; 

  /**
   * 🚨 Método clave: Genera los encabezados HTTP con el Token JWT adjunto.
   */
  private getHttpOptions(params?: { [key: string]: any }): { headers: HttpHeaders, params?: HttpParams } {
    // 1. Obtener el token del almacenamiento local
    const token = localStorage.getItem('token'); 
    
    // 2. Inicializar encabezados estándar (Content-Type)
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // 3. Adjuntar el token si existe
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let httpParams: HttpParams | undefined;
    if (params) {
        httpParams = new HttpParams({ fromObject: params });
    }

    return { headers, params: httpParams };
  }

  // =========================================================
  // Métodos CRUD que utilizan getHttpOptions()
  // =========================================================

  get<T>(path: string, params?: { [key: string]: any }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, this.getHttpOptions(params));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body, this.getHttpOptions());
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body, this.getHttpOptions());
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`, this.getHttpOptions());
  }
}