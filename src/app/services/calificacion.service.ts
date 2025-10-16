import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotaPayload {
  estudianteId: string;
  materiaId: string;
  valor: number;
}

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private base = '/api/calificaciones';

  constructor(private http: HttpClient) {}

  guardarNotasCurso(cursoId: string, notas: NotaPayload[]): Observable<any> {
    return this.http.put<any>(`${this.base}/curso/${cursoId}`, { notas });
  }
}
