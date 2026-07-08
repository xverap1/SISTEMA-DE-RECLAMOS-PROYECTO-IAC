import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service'; // 🌟 Inyectamos tu servicio de Toasts
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const toastService = inject(ToastService); // 🌟 Conseguimos la instancia del Toast
  let token: string | null = null;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('access_token');
  }

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      const esPeticionLogin = req.url.includes('/auth/login') || req.url.includes('/login');

      if ((error.status === 401 || error.status === 403) && !esPeticionLogin) {

        console.warn('La sesión ha caducado o el token es inválido. Redirigiendo...');
        
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('usuario_sesion');
          localStorage.removeItem('currentUser'); 
        }
        
        toastService.showError(
          'Sesión Caducada', 
          'Tu sesión ha expirado por seguridad. Por favor, ingresa tus credenciales nuevamente.'
        );
        
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};