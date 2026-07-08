/**
 * Estructura de envío hacia Spring Boot
 */
export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

/**
 * Estructura de respuesta que nos devuelve tu backend
 */
export interface LoginResponse {
  access_token: string;
  username: string;
  nombreCompleto: string;
  area: string;
  rol: string;
  nombreSupervisor: string;
}