import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const allowedRoles: string[] = (route.data && route.data['roles']) || [];
    try {
      const role = await this.auth.getUserRole();
      if (!role) {
        await this.router.navigate(['/login']);
        return false;
      }

      if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
        return true;
      }

      // No autorizado para esta ruta
      await this.router.navigate(['/inicio']);
      return false;
    } catch (err) {
      await this.router.navigate(['/login']);
      return false;
    }
  }
}
