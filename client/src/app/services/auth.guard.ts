import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.services';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getProfile().pipe(
    map((user: any) => {
      if (user.role === 'Admin') {
        // Zustand aktualisieren
        authService.loggedIn.next(true);
        authService.username.next(user.username);
        authService.role.next(user.role);
        return true;
      } else {
        router.navigate(['/feed']); // z. B. zurück zur Startseite
        return false;
      }
    }),
    catchError(() => {
      authService.loggedIn.next(false);
      router.navigate(['/login']);
      return of(false);
    })
  );
};
