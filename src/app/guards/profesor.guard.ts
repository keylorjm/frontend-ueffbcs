import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ProfesorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated$) {
    router.navigate(['/login']);
    return false;
  }
  if (auth.role !== 'profesor') {
    router.navigate(['/']);
    return false;
  }
  return true;
};
