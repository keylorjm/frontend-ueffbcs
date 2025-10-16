// recuperar-contrasena.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatInputModule, 
    MatFormFieldModule, MatButtonModule, MatIconModule, RouterLink
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card mat-elevation-z8">
        <mat-card-header>
          <mat-card-title>
            Recuperar Contraseña
          </mat-card-title>
          <mat-card-subtitle>Ingresa tu correo para recibir instrucciones.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="enviarInstrucciones()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput type="email" [(ngModel)]="correo" name="correo" required>
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width login-button"
              [disabled]="!correo"
            >
              Enviar Instrucciones
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="footer-actions">
          <a mat-button routerLink="/login">Volver al Login</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrl: '../login/login.scss' // Reusa el mismo estilo
})
export class RecuperarContrasenaComponent {
  correo: string = '';

  enviarInstrucciones() {
    console.log('Enviando instrucciones a:', this.correo);
    // Lógica para llamar al endpoint de recuperación de contraseña
  }
}
