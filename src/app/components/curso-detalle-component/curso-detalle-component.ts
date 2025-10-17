import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu'; // Añadido para acciones de gestión

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
    MatTooltipModule,
    MatMenuModule,
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-100">
      
      <header
        class="sticky top-0 z-10 bg-white shadow-md px-6 py-4 flex items-center justify-between border-b border-gray-200"
      >
        <div class="flex items-center gap-4">
          <button mat-icon-button (click)="volver()" matTooltip="Volver">
            <mat-icon color="primary">arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-800">
              {{ curso()?.nombre || 'Cargando curso...' }}
            </h1>
            <p class="text-sm text-gray-500">Detalles del curso</p>
          </div>
        </div>

        <div class="flex items-center gap-3" *ngIf="curso() as c">
          
          <mat-chip-set class="hidden md:flex">
            <mat-chip color="primary" selected class="!bg-blue-100/50 !text-blue-800" matTooltip="Total de materias">
              <mat-icon class="mr-1">menu_book</mat-icon>
              {{ materias().length }} materias
            </mat-chip>
            <mat-chip color="accent" selected class="!bg-indigo-100/50 !text-indigo-800" matTooltip="Total de estudiantes">
              <mat-icon class="mr-1">group</mat-icon>
              {{ estudiantes().length }} estudiantes
            </mat-chip>
          </mat-chip-set>

          <button mat-flat-button [matMenuTriggerFor]="menuAcciones" color="primary">
            <mat-icon>settings</mat-icon>
            <span class="hidden sm:inline-flex ml-2">Gestionar</span>
          </button>
          
          <mat-menu #menuAcciones="matMenu">
            <button mat-menu-item (click)="editarCurso(c)">
              <mat-icon color="primary">edit</mat-icon>
              <span>Editar Curso</span>
            </button>
            <button mat-menu-item (click)="eliminarCurso(c)">
              <mat-icon color="warn">delete</mat-icon>
              <span>Eliminar Curso</span>
            </button>
          </mat-menu>

        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        
        <ng-container *ngIf="estado() === 'cargando' || estado() === 'error'">
          <mat-card class="p-8 text-center shadow-lg">
            <ng-container *ngIf="estado() === 'cargando'">
              <mat-icon class="animate-spin text-blue-600 mb-4 text-4xl">sync</mat-icon>
              <p class="text-lg font-medium">Cargando información del curso...</p>
            </ng-container>
            <ng-container *ngIf="estado() === 'error'">
              <mat-icon class="text-red-600 mb-4 text-4xl">error_outline</mat-icon>
              <p class="text-lg font-medium text-red-600">Error: No se pudo cargar el curso.</p>
              <button mat-flat-button color="primary" (click)="volver()" class="mt-4">
                <mat-icon>arrow_back</mat-icon> Volver
              </button>
            </ng-container>
          </mat-card>
        </ng-container>

        <ng-container *ngIf="estado() === 'ok' && curso() as c">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="lg:col-span-1 flex flex-col gap-6">
              
              <mat-card class="shadow-xl p-0">
                <header class="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-blue-50 rounded-t-lg">
                  <div class="flex items-center gap-2">
                    <mat-icon color="primary">person_pin</mat-icon>
                    <h3 class="text-lg font-semibold text-gray-800">Tutor Principal</h3>
                  </div>
                  <button mat-icon-button color="primary" (click)="asignarTutor(c)" matTooltip="Asignar o cambiar tutor">
                    <mat-icon>manage_accounts</mat-icon>
                  </button>
                </header>

                <div class="p-5">
                  <ng-container *ngIf="tutorObj(); else noTutor">
                    <div class="flex items-center gap-3 p-2 bg-blue-50/50 rounded-lg">
                      <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-500">
                        <mat-icon color="primary" class="!text-3xl">badge</mat-icon>
                      </div>
                      <div>
                        <p class="text-base font-semibold text-gray-900 leading-tight">
                          {{ tutorObj()!.nombre }}
                        </p>
                        <p class="text-sm text-gray-600 italic">Profesor Tutor</p>
                      </div>
                    </div>
                  </ng-container>

                  <ng-template #noTutor>
                    <div class="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                      <mat-icon class="mb-1">sentiment_dissatisfied</mat-icon>
                      <p class="italic text-sm">Sin tutor asignado aún.</p>
                      <button mat-button color="primary" (click)="asignarTutor(c)" class="mt-2">
                        Asignar Tutor
                      </button>
                    </div>
                  </ng-template>
                </div>
              </mat-card>
            </div>


            <div class="lg:col-span-2 flex flex-col gap-6">

              <mat-card class="shadow-xl p-0">
                <header class="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white rounded-t-lg">
                  <div class="flex items-center gap-2">
                    <mat-icon color="accent">menu_book</mat-icon>
                    <h3 class="text-lg font-semibold text-gray-800">Materias</h3>
                    <span class="text-sm text-gray-500">({{ materias().length }})</span>
                  </div>
                  <button mat-flat-button color="accent" (click)="agregarMateria(c)" matTooltip="Agregar nueva materia o asociar">
                    <mat-icon>add</mat-icon>
                    <span class="hidden sm:inline ml-1">Agregar</span>
                  </button>
                </header>

                <div class="max-h-[20rem] overflow-y-auto">
                  <mat-list>
                    <div
                      *ngIf="materias().length === 0"
                      class="p-5 text-gray-500 flex items-center gap-3"
                    >
                      <mat-icon>library_add</mat-icon>
                      <span class="italic">No hay materias en este curso.</span>
                    </div>

                    <ng-container *ngFor="let m of materias(); let last = last">
                      <mat-list-item class="!py-3 hover:bg-gray-50 transition duration-150">
                        <mat-icon matListIcon color="accent">bookmark_added</mat-icon>
                        <div matListItemTitle class="font-medium text-gray-900">{{ m.nombre }}</div>
                        <div matListItemLine class="text-sm text-gray-500">Materia asociada</div>
                        <div class="flex gap-2">
                          <button mat-icon-button (click)="editarMateria(m)" matTooltip="Editar materia">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="eliminarMateria(m)" matTooltip="Desasociar/Eliminar">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      </mat-list-item>
                      <mat-divider *ngIf="!last"></mat-divider>
                    </ng-container>
                  </mat-list>
                </div>
              </mat-card>

              <mat-card class="shadow-xl p-0">
                <header class="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white rounded-t-lg">
                  <div class="flex items-center gap-2">
                    <mat-icon color="warn">group</mat-icon>
                    <h3 class="text-lg font-semibold text-gray-800">Estudiantes Inscritos</h3>
                    <span class="text-sm text-gray-500">({{ estudiantes().length }})</span>
                  </div>
                  <button mat-flat-button color="warn" (click)="agregarEstudiante(c)" matTooltip="Inscribir un estudiante">
                    <mat-icon>person_add</mat-icon>
                    <span class="hidden sm:inline ml-1">Inscribir</span>
                  </button>
                </header>

                <div class="max-h-[20rem] overflow-y-auto">
                  <mat-list>
                    <div
                      *ngIf="estudiantes().length === 0"
                      class="p-5 text-gray-500 flex items-center gap-3"
                    >
                      <mat-icon>person_off</mat-icon>
                      <span class="italic">Este curso no tiene estudiantes inscritos.</span>
                    </div>

                    <ng-container *ngFor="let e of estudiantes(); let last = last">
                      <mat-list-item class="!py-3 hover:bg-gray-50 transition duration-150">
                        <div
                          matListAvatar
                          class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0"
                        >
                          {{ e.nombre.charAt(0) }}
                        </div>
                        <div>
                          <div matListItemTitle class="font-medium text-gray-900">{{ e.nombre }}</div>
                          <div matListItemLine class="text-sm text-gray-500">Estudiante</div>
                        </div>
                        <div class="flex gap-2">
                          <button mat-icon-button (click)="editarEstudiante(e)" matTooltip="Editar estudiante">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="eliminarEstudiante(e)" matTooltip="Dar de baja/Eliminar">
                            <mat-icon>person_remove</mat-icon>
                          </button>
                        </div>
                      </mat-list-item>
                      <mat-divider *ngIf="!last"></mat-divider>
                    </ng-container>
                  </mat-list>
                </div>
              </mat-card>
            </div>
          </div>
        </ng-container>
      </main>

      <footer class="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button mat-stroked-button color="primary" (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
          Atrás
        </button>

        <a mat-flat-button color="accent" [routerLink]="['/app/cursos']">
          <mat-icon>list_alt</mat-icon>
          Ver Cursos
        </a>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }
      mat-list {
        padding: 0;
      }
      /* Asegura que los ítems de lista tengan espacio suficiente para los iconos de acción */
      .mat-mdc-list-item {
        height: auto !important;
      }
    `,
  ],
})
export class CursoDetalleComponent {
  // Las inyecciones y la lógica se mantienen intactas.
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
    Array.isArray(this._curso()?.estudiantes)
      ? (this._curso()!.estudiantes as any as Estudiante[])
      : []
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
      },
    });
  }

  volver() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/app/cursos']);
    }
  }

  // MÉTODOS DE GESTIÓN (CRUD) - SIN CAMBIOS EN LA FUNCIONALIDAD
  editarCurso(curso: Curso) {
    console.log('Abrir modal/formulario para editar el curso:', curso.nombre);
    // Lógica para abrir modal de edición...
  }

  eliminarCurso(curso: Curso) {
    console.log('Abrir modal/confirmación para eliminar el curso:', curso.nombre);
    // Lógica para abrir modal de confirmación...
  }
  
  asignarTutor(curso: Curso) {
    console.log('Abrir modal/selección para asignar tutor al curso:', curso.nombre);
    // Lógica para asignar tutor...
  }

  agregarMateria(curso: Curso) {
    console.log('Abrir modal/formulario para agregar materia al curso:', curso.nombre);
    // Lógica para agregar materia...
  }

  editarMateria(materia: Materia) {
    console.log('Abrir modal/formulario para editar la materia:', materia.nombre);
    // Lógica para editar materia...
  }

  eliminarMateria(materia: Materia) {
    console.log('Abrir modal/confirmación para eliminar la materia:', materia.nombre);
    // Lógica para desasociar/eliminar materia...
  }

  agregarEstudiante(curso: Curso) {
    console.log('Abrir modal/selección para agregar estudiante al curso:', curso.nombre);
    // Lógica para agregar estudiante...
  }

  editarEstudiante(estudiante: Estudiante) {
    console.log('Abrir modal/formulario para editar el estudiante:', estudiante.nombre);
    // Lógica para editar estudiante...
  }

  eliminarEstudiante(estudiante: Estudiante) {
    console.log('Abrir modal/confirmación para eliminar el estudiante:', estudiante.nombre);
    // Lógica para desasociar/eliminar estudiante...
  }
}