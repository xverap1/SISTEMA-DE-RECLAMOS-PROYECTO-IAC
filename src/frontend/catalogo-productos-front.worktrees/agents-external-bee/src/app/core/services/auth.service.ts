import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // <- Importa PLATFORM_ID
import { isPlatformBrowser } from '@angular/common';           // <- Importa isPlatformBrowser
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../data/interfaces/auth.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly URL_API = `${environment.backendUrl}/auth/login`;

  // Inyectamos el PLATFORM_ID para que el servicio sepa si corre en el servidor o en el cliente
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.URL_API, credenciales).pipe(
      tap((res: LoginResponse) => {
if (isPlatformBrowser(this.platformId)) {
  if (res && res.access_token) {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('usuario_username', res.username);
    
    // Guardamos el perfil completo en el navegador
    localStorage.setItem('usuario_nombre', res.nombreCompleto);
    localStorage.setItem('usuario_area', res.area);
    localStorage.setItem('usuario_rol', res.rol);
    localStorage.setItem('usuario_supervisor', res.nombreSupervisor);
  }
}
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('usuario_sesion');
    }
  }

  isAutenticado(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  
  obtenerRolUsuario(): string {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioRol = localStorage.getItem('usuario_rol');
      if (usuarioRol) {
        return usuarioRol; // Retorna 'ROLE_ADMIN', 'ROLE_USER' o 'ROLE_GUEST'
      }
    }
    return '';
  }

  
  esAdmin(): boolean {
    return this.obtenerRolUsuario() === 'ROLE_ADMIN';
  }

  puedeEditar(): boolean {
    const rol = this.obtenerRolUsuario();
    return rol === 'ROLE_ADMIN' || rol === 'ROLE_USER';
  }

}