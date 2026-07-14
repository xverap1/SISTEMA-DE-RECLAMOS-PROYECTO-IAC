import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditoriaProducto {
  id?: number;
  productoId: number;
  claveProducto: string;
  nombreProducto: string;
  usuarioAuditor: string;
  accion: 'CREACIÓN' | 'MODIFICACIÓN' | 'DESACTIVACIÓN';
  detalles: string;
  fechaMovimiento: string; // Recibe el String formateado de Spring ("dd/MM/yyyy HH:mm:ss")
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private readonly URL_API = `${environment.backendUrl}/auditoria`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de auditorías ordenadas cronológicamente
   */
  obtenerHistorial(): Observable<AuditoriaProducto[]> {
    // Nota: Como usas JWT, tu HttpInterceptor añadirá el token automáticamente en la cabecera 'Authorization'
    return this.http.get<AuditoriaProducto[]>(`${this.URL_API}/historial`);
  }
}