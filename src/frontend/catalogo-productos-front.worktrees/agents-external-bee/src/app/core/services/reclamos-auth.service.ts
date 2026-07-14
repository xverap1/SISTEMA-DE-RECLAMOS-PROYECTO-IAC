import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
  ICognitoStorage,
} from 'amazon-cognito-identity-js';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'reclamos_id_token';

/** Storage en memoria para SSR: amazon-cognito-identity-js exige un objeto
 *  Storage al construir el CognitoUserPool, y en el servidor (Node) no
 *  existe `localStorage`. Nunca se usa de verdad en el servidor porque el
 *  login solo ocurre en el navegador (ver guards de isPlatformBrowser abajo). */
class MemoryStorage implements ICognitoStorage {
  private data: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.data[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.data[key] = value;
  }
  removeItem(key: string): void {
    delete this.data[key];
  }
  clear(): void {
    this.data = {};
  }
}

/**
 * Autenticación de ciudadanos contra el Cognito User Pool de la
 * arquitectura serverless (ver iac/cognito.tf). Es independiente del
 * AuthService que usa el backend Spring Boot para el personal
 * administrativo (módulo de productos) — son dos sistemas de usuarios
 * distintos, con dos tokens distintos.
 */
@Injectable({
  providedIn: 'root',
})
export class ReclamosAuthService {
  private pool: CognitoUserPool | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /** Construye el User Pool de forma perezosa (nunca durante SSR/prerender). */
  private get userPool(): CognitoUserPool {
    if (!this.pool) {
      this.pool = new CognitoUserPool({
        UserPoolId: environment.cognito.userPoolId,
        ClientId: environment.cognito.clientId,
        Storage: isPlatformBrowser(this.platformId) ? undefined : new MemoryStorage(),
      });
    }
    return this.pool;
  }

  /** Registra un nuevo ciudadano. Cognito envía un código de verificación por email. */
  registrar(nombre: string, email: string, password: string, telefono?: string): Promise<void> {
    const atributos = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: nombre }),
    ];
    if (telefono) {
      atributos.push(new CognitoUserAttribute({ Name: 'phone_number', Value: telefono }));
    }

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, atributos, [], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /** Confirma el registro con el código de 6 dígitos recibido por email. */
  confirmarRegistro(email: string, codigo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.crearCognitoUser(email).confirmRegistration(codigo, true, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /** Autentica al ciudadano (SRP) y guarda el ID token (el que espera el API Gateway). */
  login(email: string, password: string): Promise<CognitoUserSession> {
    const detalles = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = this.crearCognitoUser(email);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(detalles, {
        onSuccess: (session) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(TOKEN_KEY, session.getIdToken().getJwtToken());
            localStorage.setItem('reclamos_email', email);
          }
          resolve(session);
        },
        onFailure: (err) => reject(err),
      });
    });
  }

  logout(): void {
    const usuarioActual = this.userPool.getCurrentUser();
    usuarioActual?.signOut();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('reclamos_email');
    }
  }

  obtenerToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private crearCognitoUser(email: string): CognitoUser {
    return new CognitoUser({ Username: email, Pool: this.userPool });
  }
}
