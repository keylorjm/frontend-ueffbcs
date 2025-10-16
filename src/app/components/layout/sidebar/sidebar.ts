// src/app/components/layout/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/app/mis-cursos" routerLinkActive="active-link">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>

      <a mat-list-item routerLink="/app/calificaciones" routerLinkActive="active-link">
        <mat-icon matListItemIcon>edit_square</mat-icon>
        <span matListItemTitle>Calificaciones</span>
      </a>

      <a mat-list-item routerLink="/app/estudiantes" routerLinkActive="active-link">
        <mat-icon matListItemIcon>school</mat-icon>
        <span matListItemTitle>Estudiantes</span>
      </a>

      <a mat-list-item routerLink="/app/usuarios" routerLinkActive="active-link">
        <mat-icon matListItemIcon>group</mat-icon>
        <span matListItemTitle>Usuarios</span>
      </a>

      <a mat-list-item routerLink="/app/cursos" routerLinkActive="active-link">
        <mat-icon matListItemIcon>bookmarks</mat-icon>
        <span matListItemTitle>Cursos</span>
      </a>

      <a mat-list-item routerLink="/app/materias" routerLinkActive="active-link">
        <mat-icon matListItemIcon>class</mat-icon>       
        <span matListItemTitle>Materias</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .mat-nav-list { padding-top: 0; }
    .active-link { background-color: rgba(0, 0, 0, 0.08); }
    mat-icon { margin-right: 16px; }
  `]
})
export class SidebarComponent {}