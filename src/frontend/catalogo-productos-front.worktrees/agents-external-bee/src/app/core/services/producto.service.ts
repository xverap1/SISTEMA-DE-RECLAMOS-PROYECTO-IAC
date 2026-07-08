import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../data/interfaces/auth.interface';
import { ReporteResponseDto } from '../../data/interfaces/producto.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Al ser Standalone, se provee automáticamente en toda la app
})
export class ProductoService {
  // URL exacta de tu controlador AuthController en Spring Boot
  private readonly URL_API = 'http://localhost:8080/api/v1/productos';

  constructor(private http: HttpClient) { }

crearProducto(producto: any): Observable<any> {
    return this.http.post(this.URL_API, producto);
  }

obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(this.URL_API);
 }

actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.URL_API}/${id}`, producto);
  }

desactivarProducto(id: number, usuarioAuditor: string): Observable<string> {
    // 🌟 Configuramos el @RequestParam de forma limpia
    const params = new HttpParams().set('usuarioAuditor', usuarioAuditor);

    // Como el backend responde un texto plano ("Producto desactivado exitosamente.") 
    // en lugar de un JSON, es OBLIGATORIO poner responseType: 'text'
    return this.http.patch(`${this.URL_API}/${id}/desactivar`, null, {
      params: params,
      responseType: 'text'
    });
  }

exportarAExcel(productosFiltrados: any[]): Observable<ReporteResponseDto> {
    return this.http.post<ReporteResponseDto>(
      `${this.URL_API}/exportar`, 
      productosFiltrados
    );
  }

}