export interface Producto {
  id?: number;
  folioNegocio?: string;
  claveProducto: string;
  nombreProducto: string;
  precio: number;
  activo?: boolean;
  fechaRegistro?: string;
  usuarioAuditor: string;
}

export interface ReporteResponseDto {
  status: number;
  message: string;
  fileName: string;
  fileBase64: string;
}