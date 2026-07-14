export type PrioridadReclamo = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoTicket = 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO';

/** Payload para crear un reclamo (POST /reclamos), ver lambda-reclamos/index.js */
export interface NuevoReclamo {
  tipoReclamo: string;
  folioReferencia: string;
  asunto: string;
  descripcion: string;
  prioridad: PrioridadReclamo;
  ubigeoIncidente: string;
  direccionIncidente: string;
}

/** Reclamo tal como lo devuelve la API (GET /reclamos, GET /reclamos/{id}) */
export interface Reclamo {
  id: number;
  tipoReclamo: string;
  folioReferencia: string;
  asunto: string;
  descripcion: string;
  prioridad: PrioridadReclamo;
  fechaRegistro: string;
  estadoTicket: EstadoTicket;
  ubigeoIncidente: string;
  direccionIncidente: string;
  respuestaSoporte?: string;
  usuarioResolvio?: string;
  fechaResolucion?: string;
  usuarioCreo: string;
}

export interface ListaReclamosResponse {
  items: Reclamo[];
  count: number;
}
