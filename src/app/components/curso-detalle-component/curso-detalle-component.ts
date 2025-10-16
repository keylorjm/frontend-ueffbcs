import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProfesorCompleto } from '../../services/curso.service';
import { Curso, CursoService } from '../../services/curso.service';
import { Materia } from '../../services/materia.service';
import { Estudiante } from '../../services/estudiante.service';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Barra superior -->
      <header class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button mat-icon-button color="accent" (click)="volver()">
            <mat-icon class="text-white">arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">
              {{ curso()?.nombre || 'Cargando curso...' }}
            </h1>
            <p class="opacity-90 text-sm">Detalles del curso</p>
          </div>
        </div>

        <div class="hidden sm:flex gap-3" *ngIf="curso()">
          <mat-chip-set>
            <mat-chip class="!bg-white/10 !text-white" matTooltip="Total de materias">
              <mat-icon class="mr-1 !text-white">menu_book</mat-icon>
              {{ materias().length }} materias
            </mat-chip>
            <mat-chip class="!bg-white/10 !text-white" matTooltip="Total de estudiantes">
              <mat-icon class="mr-1 !text-white">group</mat-icon>
              {{ estudiantes().length }} estudiantes
            </mat-chip>
          </mat-chip-set>
        </div>
      </header>

      <!-- Contenido -->
      <main class="flex-1 overflow-y-auto px-6 py-8 grid gap-8 w-full">
        <ng-container *ngIf="estado() === 'cargando'">
          <section class="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
            <p>Cargando información del curso…</p>
          </section>
        </ng-container>

        <ng-container *ngIf="estado() === 'error'">
          <section class="rounded-xl border border-red-200 bg-white shadow-sm p-6">
            <p class="text-red-600 font-medium">No se pudo cargar el curso.</p>
            <button mat-stroked-button color="primary" (click)="volver()">
              <mat-icon>arrow_back</mat-icon>
              Volver
            </button>
          </section>
        </ng-container>

        <ng-container *ngIf="estado() === 'ok' && curso() as c">
          <!-- Tutor -->
          <section class="bg-white">
            <header class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <mat-icon color="primary">person</mat-icon>
              <h3 class="text-lg font-semibold text-gray-800">Tutor asignado</h3>
            </header>

            <div class="px-5 py-4">
              <ng-container *ngIf="tutorObj(); else noTutor">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <mat-icon color="primary">badge</mat-icon>
                  </div>
                  <div>
                    <p class="text-base font-medium text-gray-900 leading-6">{{ tutorObj()!.nombre }}</p>
                    <p class="text-sm text-gray-500">Tutor responsable</p>
                  </div>
                </div>
              </ng-container>

              <ng-template #noTutor>
                <div class="flex items-center gap-3 text-gray-500">
                  <mat-icon>info</mat-icon>
                  <p class="italic">Tutor no disponible o sin asignar.</p>
                </div>
              </ng-template>
            </div>
          </section>

          <!-- Materias -->
          <section class="bg-white">
            <header class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <mat-icon color="primary">menu_book</mat-icon>
              <h3 class="text-lg font-semibold text-gray-800">
                Materias
                <span class="text-sm text-gray-500">({{ materias().length }})</span>
              </h3>
            </header>

            <div class="max-h-80 overflow-y-auto">
              <mat-list>
                <div *ngIf="materias().length === 0" class="p-4 text-gray-500 flex items-center gap-3">
                  <mat-icon>library_books</mat-icon>
                  <span class="italic">Este curso no tiene materias asignadas.</span>
                </div>

                <ng-container *ngFor="let m of materias(); let last = last">
                  <mat-list-item class="!py-3">
                    <mat-icon matListIcon color="primary">bookmark_added</mat-icon>
                    <div matLine class="font-medium text-gray-900">{{ m.nombre }}</div>
                  </mat-list-item>
                  <mat-divider *ngIf="!last"></mat-divider>
                </ng-container>
              </mat-list>
            </div>
          </section>

          <!-- Estudiantes -->
          <section class="bg-white">
            <header class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <mat-icon color="warn">group</mat-icon>
              <h3 class="text-lg font-semibold text-gray-800">
                Estudiantes inscritos
                <span class="text-sm text-gray-500">({{ estudiantes().length }})</span>
              </h3>
            </header>

            <div class="max-h-80 overflow-y-auto">
              <mat-list>
                <div *ngIf="estudiantes().length === 0" class="p-4 text-gray-500 flex items-center gap-3">
                  <mat-icon>person_off</mat-icon>
                  <span class="italic">Este curso no tiene estudiantes inscritos.</span>
                </div>

                <ng-container *ngFor="let e of estudiantes(); let last = last">
                  <mat-list-item class="!py-3">
                    <div matListAvatar class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div>
                      <div matLine class="font-medium text-gray-900">{{ e.nombre }}</div>
                      <div matLine class="text-sm text-gray-500">Estudiante</div>
                    </div>
                  </mat-list-item>
                  <mat-divider *ngIf="!last"></mat-divider>
                </ng-container>
              </mat-list>
            </div>
          </section>
        </ng-container>
      </main>

      <!-- Barra inferior -->
      <footer class="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button mat-stroked-button color="primary" (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
          Atrás
        </button>
        <a mat-flat-button color="primary" [routerLink]="['/cursos']">
          <mat-icon>close</mat-icon>
          Ir a cursos
        </a>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    mat-list { padding: 0; }
    .mat-mdc-list-item { height: auto !important; }
  `]
})
export class CursoDetalleComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursoService = inject(CursoService);

  private _curso = signal<Curso | null>(null);
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');

  curso = computed(() => this._curso());
  materias = computed<Materia[]>(() =>
    Array.isArray(this._curso()?.materias) ? (this._curso()!.materias as any as Materia[]) : []
  );
  estudiantes = computed<Estudiante[]>(() =>
    Array.isArray(this._curso()?.estudiantes) ? (this._curso()!.estudiantes as any as Estudiante[]) : []
  );

  private isTutorObject(x: unknown): x is ProfesorCompleto {
    return typeof x === 'object' && x !== null && 'nombre' in (x as any);
  }
  tutorObj = computed<ProfesorCompleto | null>(() => {
    const t = this._curso()?.profesorTutor as unknown;
    return this.isTutorObject(t) ? (t as ProfesorCompleto) : null;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.estado.set('error');
      return;
    }
    this.cargarCurso(id);
  }

  private cargarCurso(id: string) {
    this.estado.set('cargando');
    this.cursoService.getById(id).subscribe({
      next: (c) => {
        this._curso.set(c);
        this.estado.set('ok');
        console.log('Curso recibido (populateado):', c);
      },
      error: (e) => {
        console.error('Error cargando curso', e);
        this.estado.set('error');
      }
    });
  }

  volver() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/cursos']);
    }
  }
}
