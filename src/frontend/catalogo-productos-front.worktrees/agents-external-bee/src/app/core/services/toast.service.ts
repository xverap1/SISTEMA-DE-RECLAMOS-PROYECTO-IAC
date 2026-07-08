import { Injectable } from '@angular/core';

export interface ToastInfo {
  header: string;
  body: string;
  classname?: string; // Para cambiar el color (bg-success, bg-danger, etc.)
  delay?: number;     // Tiempo en milisegundos antes de desaparecer
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: ToastInfo[] = [];

  // Método para mostrar un Toast de éxito (Verde)
  showSuccess(header: string, body: string) {
    this.show({ header, body, classname: 'bg-success text-white', delay: 3000 });
  }

  // Método para mostrar un Toast de error (Rojo)
  showError(header: string, body: string) {
    this.show({ header, body, classname: 'bg-danger text-white', delay: 4000 });
  }

  // Método base para agregar al arreglo
  show(toast: ToastInfo) {
    this.toasts.push(toast);
  }

  // Método para remover el Toast cuando expire
  remove(toast: ToastInfo) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  // Limpiar todos los toasts de golpe si fuera necesario
  clear() {
    this.toasts = [];
  }
}