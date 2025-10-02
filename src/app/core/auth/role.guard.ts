//=================[Role Guard]=========
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, RoleName } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Debe estar autenticado
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const allowed: RoleName[] | undefined = (route.data?.['allowedRoles'] as RoleName[] | undefined);
  if (!allowed || allowed.length === 0) return true;

  if (auth.isRoleOneOf(allowed)) return true;

  router.navigate(['/unauthorized']);
  return false;
};
