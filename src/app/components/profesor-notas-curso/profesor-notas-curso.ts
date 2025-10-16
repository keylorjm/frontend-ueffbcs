import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';

import { CursoService, Curso } from '../../services/curso.service';
import { CalificacionService, NotaPayload } from '../../services/calificacion.service';

@Component({
  selector: 'app-profesor-notas-curso',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule
  ],
  template: `
    <div class="p-6 min-h-screen bg-gray-50">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-semibold">Notas — {{ curso()?.nombre || 'Cargando…' }}</h2>
          <p class="text-gray-600">Ingrese/actualice las notas para los estudiantes y materias.</p>
        </div>
        <div class="flex gap-2">
          <a mat-stroked-button color="primary" [routerLink]="['/profesor/mis-cursos']">
            <mat-icon>arrow_back</mat-icon>
            Mis cursos
          </a>
          <a mat-stroked-button color="primary" [routerLink]="['/curso-detalle', curso()?._id]">
            <mat-icon>visibility</mat-icon>
            Ver detalle
          </a>
        </div>
      </div>

      <ng-container *ngIf="curso(); else loadingTpl">
        <form [formGroup]="form" class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="estudiantes()" class="w-full min-w-[720px]">
              <!-- Estudiante -->
              <ng-container matColumnDef="estudiante">
                <th mat-header-cell *matHeaderCellDef> Estudiante </th>
                <td mat-cell *matCellDef="let e; let i = index">
                  <div class="font-medium">{{ e.nombre }}</div>
                  <div class="text-xs text-gray-500" *ngIf="e.cedula">{{ e.cedula }}</div>
                </td>
              </ng-container>

              <!-- Materias dinámicas -->
              <ng-container *ngFor="let m of materias(); let mIdx = index" [matColumnDef]="'m'+mIdx">
                <th mat-header-cell *matHeaderCellDef> {{ m.nombre }} </th>
                <td mat-cell *matCellDef="let e; let eIdx = index">
                  <input
                    matInput
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    [formControlName]="ctrlName(eIdx, mIdx)"
                    class="w-24">
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns();"></tr>
            </table>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button mat-stroked-button color="primary" type="button" (click)="resetNotas()">
              <mat-icon>restart_alt</mat-icon>
              Reset
            </button>
            <button mat-flat-button color="primary" type="button" (click)="guardar()">
              <mat-icon>save</mat-icon>
              Guardar notas
            </button>
          </div>
        </form>
      </ng-container>

      <ng-template #loadingTpl>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">Cargando curso…</div>
      </ng-template>
    </div>
  `
})
export class ProfesorNotasCurso {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cursoService = inject(CursoService);
  private calificacionService = inject(CalificacionService);

  private _curso = signal<Curso | null>(null);
  curso = computed(() => this._curso());
  estudiantes = computed(() => this._curso()?.estudiantes ?? []);
  materias = computed(() => this._curso()?.materias ?? []);

  form = this.fb.group({});

  ngOnInit() {
    // ✅ Aseguramos string, nunca undefined
    const id: string = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      console.error('No se proporcionó id de curso en la ruta');
      this.router.navigate(['/profesor/mis-cursos']);
      return;
    }

    this.cursoService.getById(id).subscribe({
      next: (c) => {
        this._curso.set(c);
        this.construirControles();
        // Aquí podrías precargar notas existentes si tu API las retorna.
      },
      error: (e) => {
        console.error('No se pudo cargar el curso', e);
        this.router.navigate(['/profesor/mis-cursos']);
      }
    });
  }

  displayedColumns() {
    return ['estudiante', ...this.materias().map((_, idx) => 'm' + idx)];
  }

  ctrlName(eIdx: number, mIdx: number) {
    return `e${eIdx}_m${mIdx}`;
  }

  private construirControles() {
    const est = this.estudiantes();
    const mat = this.materias();
    const group: Record<string, any> = {};
    est.forEach((_, eIdx) => {
      mat.forEach((_, mIdx) => {
        group[this.ctrlName(eIdx, mIdx)] = [null, [Validators.min(0), Validators.max(20)]];
      });
    });
    this.form = this.fb.group(group);
  }

  resetNotas() {
    this.form.reset();
  }

  guardar() {
    const cursoActual = this.curso();
    if (!cursoActual || !cursoActual._id) {
      alert('Curso no disponible');
      return;
    }

    const cursoId: string = String(cursoActual._id); // ✅ garantizamos string

    const notas: NotaPayload[] = [];
    const est = this.estudiantes();
    const mat = this.materias();

    est.forEach((e: any, eIdx: number) => {
      const estudianteId: string | undefined = e?._id;
      if (!estudianteId) return; // protege por si viniera mal

      mat.forEach((m: any, mIdx: number) => {
        const materiaIdMaybe = m?._id ?? m?.id ?? m?.uid;
        if (!materiaIdMaybe) return; // protege si la materia no tiene id

        const valor = this.form.get(this.ctrlName(eIdx, mIdx))?.value;
        if (valor !== null && valor !== undefined && valor !== '') {
          notas.push({
            estudianteId: String(estudianteId),     // ✅ fuerza string
            materiaId: String(materiaIdMaybe),      // ✅ fuerza string
            valor: Number(valor)
          });
        }
      });
    });

    this.calificacionService.guardarNotasCurso(cursoId, notas).subscribe({
      next: () => alert('Notas guardadas correctamente'),
      error: (e) => {
        console.error(e);
        alert('Ocurrió un error al guardar las notas');
      }
    });
  }
}
