import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of, switchMap, map } from 'rxjs';

export const AdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const returnUrl = state.url || '/';

  return auth.isAuthenticated$.pipe(
    switchMap(isAuth => {
      if (!isAuth && !auth.getToken()) {
        return of(router.createUrlTree(['/login'], { queryParams: { returnUrl } }));
      }
      if (isAuth) {
        return of((auth.role ?? '').toLowerCase() === 'admin'
          ? true
          : router.createUrlTree(['/login'], { queryParams: { returnUrl } }));
      }
      // hay token pero aún no se cargó el user
      return auth.ensureUserLoaded().pipe(
        map(ok => {
          if (!ok) return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
          return (auth.role ?? '').toLowerCase() === 'admin'
            ? true
            : router.createUrlTree(['/login'], { queryParams: { returnUrl } });
        })
      );
    })
  );
};
