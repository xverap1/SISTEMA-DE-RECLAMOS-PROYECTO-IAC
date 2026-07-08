import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
    private readonly URL_API = 'http://localhost:8080/api/v1/auditoria';
  //private apiUrl = `${environment.apiUrl}/auditoria`; // http://localhost:8080/api/v1/auditoria

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de auditorías ordenadas cronológicamente
   */
  obtenerHistorial(): Observable<AuditoriaProducto[]> {
    // Nota: Como usas JWT, tu HttpInterceptor añadirá el token automáticamente en la cabecera 'Authorization'
    return this.http.get<AuditoriaProducto[]>(`${this.URL_API}/historial`);
  }
}