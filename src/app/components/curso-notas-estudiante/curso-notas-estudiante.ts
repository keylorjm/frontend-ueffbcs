import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CursoService, Curso } from '../../services/curso.service';
import { CalificacionService, NotaPayload } from '../../services/calificacion.service';

@Component({
  selector: 'app-curso-notas-estudiante',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatListModule, MatDividerModule, MatSnackBarModule,
  ],
  template: `
    <div class="p-6 min-h-screen bg-gray-50 grid gap-6">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold">Notas por estudiante</h2>
          <p class="text-gray-600">Curso: <b>{{ curso()?.nombre || 'Cargando…' }}</b></p>
        </div>
        <div class="flex gap-2">
          <a mat-stroked-button color="primary" [routerLink]="['/app/curso-detalle', curso()?._id]">
            <mat-icon>visibility</mat-icon> Detalle
          </a>
          <a mat-stroked-button color="primary" routerLink="/app/mis-cursos">
            <mat-icon>arrow_back</mat-icon> Mis cursos
          </a>
        </div>
      </div>

      <!-- Buscador -->
      <mat-card class="rounded-xl border border-gray-200">
        <div class="p-4 grid gap-3">
          <div class="grid md:grid-cols-2 gap-3">
            <mat-form-field>
              <mat-label>Buscar por cédula</mat-label>
              <input matInput [value]="qCedula()" (input)="setQCedula($any($event.target).value)" placeholder="Ej: 0102030405">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Buscar por nombre</mat-label>
              <input matInput [value]="qNombre()" (input)="setQNombre($any($event.target).value)" placeholder="Nombre o apellido">
            </mat-form-field>
          </div>

          <div class="max-h-72 overflow-y-auto border border-gray-200 rounded-lg">
            <mat-nav-list>
              <a mat-list-item *ngFor="let e of estudiantesFiltrados()"
                 (click)="seleccionar(e)" [class.bg-blue-50]="seleccion()?._id === e.uid">
                <div matListItemTitle class="font-medium">{{ e.nombre }}</div>
                <div matListItemLine class="text-sm text-gray-600">
                  {{ e.cedula || '—' }}
                </div>
              </a>
            </mat-nav-list>
          </div>
          <div *ngIf="estudiantesFiltrados().length === 0" class="text-gray-500 italic">
            No se encontraron estudiantes con esos criterios.
          </div>
        </div>
      </mat-card>

      <!-- Formulario de notas -->
      <mat-card class="rounded-xl border border-gray-200" *ngIf="seleccion(); else seleccioneEst">
        <div class="p-4 grid gap-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Estudiante seleccionado</div>
              <div class="text-lg font-semibold">{{ seleccion()?.nombre }}</div>
              <div class="text-sm text-gray-600">Cédula: {{ seleccion()?.cedula || '—' }}</div>
            </div>

            <button mat-stroked-button color="primary" (click)="limpiarSeleccion()">
              <mat-icon>close</mat-icon> Limpiar selección
            </button>
          </div>

          <form [formGroup]="formNotas" class="grid gap-3">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div class="border border-gray-200 rounded-lg p-3" *ngFor="let m of materias(); let i = index">
                <div class="text-sm text-gray-600 mb-2">Materia</div>
                <div class="font-medium mb-2">{{ m.nombre }}</div>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nota (0 - 20)</mat-label>
                  <input matInput type="number" min="0" max="20" step="0.1" [formControlName]="ctrlName(m, i)">
                </mat-form-field>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" mat-stroked-button color="primary" (click)="resetNotas()">
                <mat-icon>restart_alt</mat-icon> Reset
              </button>
              <button type="button" mat-flat-button color="primary" (click)="guardar()">
                <mat-icon>save</mat-icon> Guardar notas
              </button>
            </div>
          </form>
        </div>
      </mat-card>

      <ng-template #seleccioneEst>
        <mat-card class="rounded-xl border border-gray-200">
          <div class="p-4 text-gray-600">Selecciona un estudiante para ingresar notas.</div>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    :host { display:block; }
    a.mat-list-item.bg-blue-50 { border-left: 3px solid rgb(59 130 246); }
  `]
})
export class CursoNotasEstudianteComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private cursoSrv = inject(CursoService);
  private califSrv = inject(CalificacionService);

  // Estado
  private _curso = signal<Curso | null>(null);
  curso = computed(() => this._curso());
  materias = computed(() => this._curso()?.materias ?? []);
  estudiantes = computed(() => this._curso()?.estudiantes ?? []);

  // Búsqueda
  private _qCedula = signal<string>('');
  private _qNombre = signal<string>('');
  qCedula = computed(() => this._qCedula());
  qNombre = computed(() => this._qNombre());
  setQCedula(v: string) { this._qCedula.set((v || '').trim()); }
  setQNombre(v: string) { this._qNombre.set((v || '').trim().toLowerCase()); }

  estudiantesFiltrados = computed(() => {
    const ced = this._qCedula();
    const nom = this._qNombre();
    return this.estudiantes().filter((e: any) => {
      const okCed = ced ? String(e?.cedula || '').includes(ced) : true;
      const nm = (e?.nombre || '').toLowerCase();
      const okNom = nom ? nm.includes(nom) : true;
      return okCed && okNom;
    });
  });

  // Selección
  private _sel = signal<any | null>(null);
  seleccion = computed(() => this._sel());

  // Formulario de notas (una por materia)
  formNotas = this.fb.group({}); // claves dinámicas por materia (con fallback por índice)

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) { this.router.navigate(['/app/mis-cursos']); return; }

    this.cursoSrv.getById(id).subscribe({
      next: (c) => { this._curso.set(c); this.construirControles(); },
      error: () => { this.snack.open('No se pudo cargar el curso', 'Cerrar', { duration: 3000 }); this.router.navigate(['/app/mis-cursos']); }
    });
  }

  /** Nombre de control seguro: usa ID si existe, si no, usa el índice. */
  ctrlName(m: any, idx: number) {
    const id = m?._id ?? m?.id ?? m?.uid;
    return `m_${id ?? 'idx' + idx}`;
  }

  private construirControles() {
    const group: Record<string, any> = {};
    this.materias().forEach((m: any, i: number) => {
      const key = this.ctrlName(m, i);
      group[key] = [null, [Validators.min(0), Validators.max(20)]];
    });
    this.formNotas = this.fb.group(group);
  }

  seleccionar(e: any) { this._sel.set(e); }
  limpiarSeleccion() { this._sel.set(null); this.formNotas.reset(); }
  resetNotas() { this.formNotas.reset(); }

  guardar() {
    const curso = this.curso();
    const est  = this.seleccion();
    const cursoId = curso?._id ?? curso?.uid;
    const estudianteId = est?._id ?? est?.id ?? est?.uid;

    if (!cursoId || !estudianteId) {
      this.snack.open('Selecciona un estudiante válido.', 'Cerrar', { duration: 3000 });
      return;
    }

    const notas: NotaPayload[] = [];
    this.materias().forEach((m: any, i: number) => {
      const materiaId = m?._id ?? m?.id ?? m?.uid;
      if (!materiaId) return; // omitimos materias sin ID

      const key = this.ctrlName(m, i);
      const val = this.formNotas.get(key)?.value;
      if (val !== null && val !== undefined && val !== '') {
        notas.push({
          estudianteId: String(estudianteId),
          materiaId: String(materiaId),
          valor: Number(val)
        });
      }
    });

    if (notas.length === 0) {
      this.snack.open('Ingresa al menos una nota.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.califSrv.guardarNotasCurso(String(cursoId), notas).subscribe({
      next: () => this.snack.open('Notas guardadas correctamente', 'Cerrar', { duration: 2500 }),
      error: () => this.snack.open('Error al guardar notas', 'Cerrar', { duration: 3000 })
    });
  }
}
