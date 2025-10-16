import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Materia } from './materia.service';
import { Estudiante } from './estudiante.service';

export interface ProfesorCompleto {
  _id?: string;
  uid?: string;
  nombre: string;
  apellido?: string;
  correo?: string;
}

export interface Curso {
  _id?: string;
  uid?: string;
  nombre: string;  
  profesorTutor: string | ProfesorCompleto;
  materias: Materia[];
  estudiantes: Estudiante[];
  estado?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
  private api = inject(ApiService);
  private basePath = 'cursos';

  // ✅ Obtiene todos los cursos (sin populate profundo)
  getAll(): Observable<Curso[]> {
    return this.api.get<any>(this.basePath).pipe(
      map((resp: any) => {
        const cursos = resp?.cursos || resp?.data || [];
        return cursos.map((curso: any) => ({
          ...curso,
          uid: curso.uid || curso._id,
        })) as Curso[];
      }),
      catchError((err) => {
        console.error('❌ Error en CursoService.getAll():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Obtiene un curso por ID con populate (usa tu endpoint GET /api/cursos/:id)
  getById(id: string): Observable<Curso> {
    return this.api.get<{ ok: boolean; curso: Curso }>(`${this.basePath}/${id}`).pipe(
      tap((resp) => console.log('📦 Curso populateado desde backend:', resp)),
      map((resp) => {
        const curso = resp.curso;
        return {
          ...curso,
          uid: curso.uid || curso._id || id,
          profesorTutor: curso.profesorTutor || null,
          materias: Array.isArray(curso.materias) ? curso.materias : [],
          estudiantes: Array.isArray(curso.estudiantes) ? curso.estudiantes : [],
        } as Curso;
      }),
      catchError((err) => {
        console.error('❌ Error en CursoService.getById():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Crear curso
  create(curso: Partial<Curso>): Observable<Curso> {
    return this.api.post<Curso>(this.basePath, curso).pipe(
      map((c) => ({ ...c, uid: c.uid || c._id })),
      catchError((err) => {
        console.error('❌ Error en CursoService.create():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Actualizar curso
  update(id: string, curso: Partial<Curso>): Observable<Curso> {
    return this.api.put<Curso>(`${this.basePath}/${id}`, curso).pipe(
      map((c) => ({ ...c, uid: c.uid || id })),
      catchError((err) => {
        console.error('❌ Error en CursoService.update():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Eliminar curso
  delete(id: string): Observable<any> {
    return this.api.delete<any>(`${this.basePath}/${id}`).pipe(
      catchError((err) => {
        console.error('❌ Error en CursoService.delete():', err);
        return throwError(() => err);
      })
    );
  }
}
export type { Estudiante, Materia };

