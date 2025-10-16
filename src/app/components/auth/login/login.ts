// src/app/components/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatInputModule, 
    MatFormFieldModule, MatButtonModule, MatIconModule, RouterLink,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './login.html', // Reusa el HTML previamente dado
  styleUrl: './login.scss'
})
export class LoginComponent {
  credenciales = { correo: '', clave: '' };
  isLoading = false;

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  iniciarSesion() {
    this.isLoading = true;

    this.authService.login(this.credenciales).subscribe({
      next: (res) => {
        this.isLoading = false;
        // La redirección a '/app/mis-cursos' se maneja dentro del AuthService.
        this.snackBar.open('¡Bienvenido! Sesión iniciada.', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        
        let mensajeError = 'Error de conexión con el servidor. Intente más tarde.';
        
        if (err.status === 401 || err.status === 400) {
          // Mensaje de credenciales inválidas (capturado del backend)
          mensajeError = err.error?.error || 'Correo o contraseña incorrectos. Por favor, verifique.';
        }
        
        this.snackBar.open(mensajeError, 'Cerrar', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}