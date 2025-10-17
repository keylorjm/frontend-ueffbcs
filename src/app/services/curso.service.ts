// src/app/services/curso.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Materia } from './materia.service';
import { Estudiante } from './estudiante.service';
import { AuthService } from './auth.service';

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
  profesorTutor: string | ProfesorCompleto | null;
  materias: Materia[];
  estudiantes: Estudiante[];
  estado?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CursoService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private basePath = 'cursos';

  /**
   * Cursos asignados al profesor autenticado.
   * Fallback escalonado:
   *  1) GET cursos/mis
   *  2) GET cursos/asignados/:profesorId
   *  3) GET cursos?profesorId=:profesorId
   */
  getMisCursos(): Observable<Curso[]> {
    const profId = this.auth.user?.id;
    return this.api.get<any>(`${this.basePath}/mis`).pipe(
      map(normalizeCursosArray),
      catchError((errPrimero) => {
        // Si el backend requiere ID explícito
        if (!profId) {
          console.warn('getMisCursos(): no hay profId y /mis falló:', errPrimero);
          return of<Curso[]>([]);
        }
        // 2) /asignados/:profesorId
        return this.api.get<any>(`${this.basePath}/asignados/${profId}`).pipe(
          map(normalizeCursosArray),
          catchError((errSegundo) => {
            // 3) ?profesorId=:id
            return this.api
              .get<any>(`${this.basePath}?profesorId=${encodeURIComponent(profId)}`)
              .pipe(
                map(normalizeCursosArray),
                catchError((errTercero) => {
                  console.error('getMisCursos(): todos los intentos fallaron', {
                    errPrimero,
                    errSegundo,
                    errTercero,
                  });
                  return of<Curso[]>([]);
                })
              );
          })
        );
      })
    );
  }

  // ✅ Obtiene todos los cursos (sin populate profundo)
  getAll(): Observable<Curso[]> {
    return this.api.get<any>(this.basePath).pipe(
      map(normalizeCursosArray),
      catchError((err) => {
        console.error('❌ Error en CursoService.getAll():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Obtiene un curso por ID (soporta distintas formas de respuesta)
  getById(id: string): Observable<Curso> {
    return this.api.get<any>(`${this.basePath}/${id}`).pipe(
      tap((resp) => console.log('📦 Curso desde backend (bruto):', resp)),
      map(normalizeCursoOne(id)),
      catchError((err) => {
        console.error('❌ Error en CursoService.getById():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Crear curso
  create(curso: Partial<Curso>): Observable<Curso> {
    return this.api.post<any>(this.basePath, curso).pipe(
      map(normalizeCursoOne()),
      catchError((err) => {
        console.error('❌ Error en CursoService.create():', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Actualizar curso
  update(id: string, curso: Partial<Curso>): Observable<Curso> {
    return this.api.put<any>(`${this.basePath}/${id}`, curso).pipe(
      map(normalizeCursoOne(id)),
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

/* -------------------- Helpers de normalización -------------------- */

function normalizeCursosArray(resp: any): Curso[] {
  const arr: any[] = Array.isArray(resp)
    ? resp
    : resp?.cursos ?? resp?.data ?? resp?.results ?? [];
  return (arr as any[])
    .map(item => normalizeCursoShape(item)) // 👈 evita que el index (number) se pase
    .filter((c) => !!c.uid);
}

function normalizeCursoOne(fallbackId?: string) {
  return (resp: any): Curso => {
    const raw = resp?.curso ?? resp?.data ?? resp; // soporta curso directo
    const normalized = normalizeCursoShape(raw, fallbackId);
    return normalized;
  };
}

function normalizeCursoShape(raw: any, fallbackId?: string | number): Curso {
  const id = raw?.uid ?? raw?._id ?? (typeof fallbackId === 'string' ? fallbackId : undefined);

  const materias = Array.isArray(raw?.materias) ? raw.materias : [];
  const estudiantes = Array.isArray(raw?.estudiantes) ? raw.estudiantes : [];

  let profesorTutor: string | ProfesorCompleto | null = null;
  if (raw?.profesorTutor) {
    if (typeof raw.profesorTutor === 'string') {
      profesorTutor = raw.profesorTutor;
    } else if (typeof raw.profesorTutor === 'object') {
      profesorTutor = {
        _id: raw.profesorTutor._id ?? raw.profesorTutor.uid,
        uid: raw.profesorTutor.uid ?? raw.profesorTutor._id,
        nombre: raw.profesorTutor.nombre ?? '',
        apellido: raw.profesorTutor.apellido,
        correo: raw.profesorTutor.correo ?? raw.profesorTutor.email,
      };
    }
  }

  return {
    _id: raw?._id ?? id,
    uid: id,
    nombre: raw?.nombre ?? '—',
    profesorTutor,
    materias,
    estudiantes,
    estado: raw?.estado,
  } as Curso;
}

