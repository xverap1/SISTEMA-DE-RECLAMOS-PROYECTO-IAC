import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ReclamosAuthService } from '../services/reclamos-auth.service';
import { environment } from '../../../environments/environment';

/**
 * Adjunta el ID token de Cognito solo a las peticiones dirigidas al API
 * Gateway de reclamos (environment.reclamosApiUrl). El resto de peticiones
 * (backend Spring Boot) las maneja jwt.interceptor.ts con su propio token.
 */
export const reclamosAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.reclamosApiUrl)) {
    return next(req);
  }

  const reclamosAuth = inject(ReclamosAuthService);
  const token = reclamosAuth.obtenerToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: token } });
  }

  return next(req);
};
