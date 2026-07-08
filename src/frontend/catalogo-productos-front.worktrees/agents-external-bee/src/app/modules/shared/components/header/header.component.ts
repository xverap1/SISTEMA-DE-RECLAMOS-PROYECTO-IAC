import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <- Para la navegación
import { AuthService } from '../../../../core/services/auth.service'; // <- Tu servicio

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  // Usamos inject() que es la sintaxis moderna de Angular
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  /**
   * Revisa si hay una sesión activa para pintar u ocultar botones
   */
  get estaLogueado(): boolean {
    return this.authService.isAutenticado();
  }

  /**
   * Obtiene el nombre del usuario firmado para darle la bienvenida
   */
  get nombreUsuario(): string {
  if (isPlatformBrowser(this.platformId)) {
    // 🌟 Ahora extraemos el Nombre Completo que viene de la BD
    return localStorage.getItem('usuario_nombre') || 'Usuario del Sistema';
  }
  return '';
}

get areaUsuario(): string {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem('usuario_area') || '';
  }
  return '';
}

  cerrarSesion(): void {
    this.authService.logout(); // Borra los tokens
    this.router.navigate(['/login']); // Lo rebota al inicio
  }
}