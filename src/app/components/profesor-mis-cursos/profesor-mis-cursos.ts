import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { CursoService, Curso } from '../../services/curso.service';

@Component({
  selector: 'app-profesor-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">Mis cursos</h2>
        <button mat-stroked-button color="primary" routerLink="/profesor">
          <mat-icon>arrow_back</mat-icon>
          Volver al dashboard
        </button>
      </div>

      <table mat-table [dataSource]="data" class="mat-elevation-z1 w-full">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef> Curso </th>
          <td mat-cell *matCellDef="let c">
            <div class="font-medium">{{ c.nombre }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef class="text-right"> Acciones </th>
          <td mat-cell *matCellDef="let c" class="text-right">
            <div class="inline-flex gap-2">
              <button mat-stroked-button color="primary" (click)="abrirNotas(c)">
                <mat-icon>edit</mat-icon>
                Notas
              </button>
              <a mat-stroked-button [routerLink]="['/curso-detalle', c._id]">
                <mat-icon>visibility</mat-icon>
                Detalle
              </a>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr *ngIf="data.length === 0 && !(isLoading$$ | async)">
          <td [attr.colspan]="displayedColumns.length" class="p-6 text-center text-gray-500">
            No tienes cursos asignados.
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    :host { display:block; }
    th.text-right, td.text-right { text-align: right; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfesorMisCursos{
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private cursoService = inject(CursoService);

  isLoading$$ = new BehaviorSubject<boolean>(false);
  data: Curso[] = [];
  displayedColumns = ['nombre', 'acciones'];

  constructor() { this.cargar(); }

  private cargar() {
    this.isLoading$$.next(true);
    this.cursoService.getMisCursos().subscribe({
      next: (rows) => { this.data = rows || []; },
      error: (e) => console.error('Error cargando mis cursos', e),
      complete: () => { this.isLoading$$.next(false); this.cdr.markForCheck(); }
    });
  }

  abrirNotas(c: Curso) {
    this.router.navigate(['/profesor/curso', c._id, 'notas']);
  }
}
