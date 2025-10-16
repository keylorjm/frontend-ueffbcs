// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Componentes de Autenticación
import { LoginComponent } from './components/auth/login/login';
import { RecuperarContrasenaComponent } from './components/auth/recuperar-contrasena/recuperar-contrasena';

// Componentes de Layout y Seguridad
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { AuthGuard } from './guards/auth.guard'; 

// Componentes de la Aplicación
import { MisCursos } from './components/mis-cursos/mis-cursos';
import { UsuarioService } from './services/usuario.service';

import { MateriasComponent } from './components/materias/materias';
import { Usuarios } from './components/usuarios/usuarios';

export const routes: Routes = [
  // 1. Ruta de Inicio (Al cargar la app, redirige al login)
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 

  // 2. Rutas de Autenticación (Públicas)
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' },  
  { path: 'restablecer-contrasena/:token', component: RecuperarContrasenaComponent, title: 'Restablecer Clave' }, 

  // 3. Rutas Protegidas (Requieren Login)
  {
    path: 'app', 
    component: MainLayoutComponent,
    canActivate: [AuthGuard], 
    children: [
      { path: '', redirectTo: 'mis-cursos', pathMatch: 'full' },
      
      { 
        path: 'mis-cursos', 
        component: MisCursos,
        title: 'Mis Cursos' 
      },
      
      { 
        path: 'usuarios', 
        component: Usuarios, 
        title: 'Gestión de Usuarios' 
      },
      
      // Implementar el resto como componentes separados
      { 
        path: 'estudiantes', 
        loadComponent: () => import('./components/estudiantes/estudiantes').then(m => m.EstudiantesComponent), 
        title: 'Gestión de Estudiantes' 
      },
      { 
        path: 'calificaciones', 
        loadComponent: () => import('./components/calificaciones/calificaciones').then(m => m.Calificaciones), 
        title: 'Ingreso de Calificaciones' 
      },
      { 
        path: 'cursos', 
        loadComponent: () => import('./components/cursos/cursos').then(m => m.CursosComponent), 
        title: 'Gestión de Cursos' 
      },

      { 
        path: 'materias', 
        loadComponent: () => import('./components/materias/materias').then(m => m.MateriasComponent), 
        title: 'Gestión de Materias' 
      },
    ]
  },

  // 4. Ruta comodín (404)
  { path: '**', redirectTo: 'login' } 
];
