import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListaReclamosResponse, NuevoReclamo, Reclamo } from '../../data/interfaces/reclamo.interface';

/**
 * Habla directo con el API Gateway de la arquitectura serverless
 * (Lambda "reclamos", ver src/lambdas/lambda-reclamos/index.js), no con el
 * backend Spring Boot. El token de Cognito lo agrega
 * reclamos-auth.interceptor.ts automáticamente.
 */
@Injectable({
  providedIn: 'root',
})
export class ReclamoService {
  private readonly URL_API = `${environment.reclamosApiUrl}/reclamos`;

  constructor(private http: HttpClient) {}

  crear(reclamo: NuevoReclamo): Observable<{ id: number; estadoTicket: string; mensaje: string }> {
    return this.http.post<{ id: number; estadoTicket: string; mensaje: string }>(this.URL_API, reclamo);
  }

  listar(estado?: string): Observable<ListaReclamosResponse> {
    const params: Record<string, string> = {};
    if (estado) {
      params['estado'] = estado;
    }
    return this.http.get<ListaReclamosResponse>(this.URL_API, { params });
  }

  obtenerPorId(id: number): Observable<Reclamo> {
    return this.http.get<Reclamo>(`${this.URL_API}/${id}`);
  }
}
