import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface NotaPayload {
  estudianteId: string;
  materiaId: string;
  valor: number;
}

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/calificaciones`;

  guardarNotasCurso(cursoId: string, notas: NotaPayload[]): Observable<any> {
    return this.http.put<any>(`${this.base}/curso/${cursoId}`, { notas });
  }
}
