import { Component } from '@angular/core';
import { ToastService, ToastInfo } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true, // Si usas Angular moderno, o impórtalo en tu AppModule
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1200;">
      
      <div *ngFor="let toast of toastService.toasts"
           class="toast show fade d-block border-0 mb-2 shadow"
           [ngClass]="toast.classname"
           role="alert" aria-live="assertive" aria-atomic="true">
        
        <div class="toast-header" [ngClass]="toast.classname" style="filter: brightness(0.95);">
          <i class="bi bi-info-circle-fill me-2"></i>
          <strong class="me-auto text-white">{{ toast.header }}</strong>
          <button type="button" class="btn-close btn-close-white" 
                  (click)="toastService.remove(toast)" aria-label="Close">
          </button>
        </div>
        
        <div class="toast-body">
          {{ toast.body }}
        </div>

        <ng-container *ngIf="autoRemove(toast)"></ng-container>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .toast-header { border-bottom: rgba(255,255,255,0.2) 1px solid; }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  autoRemove(toast: ToastInfo): boolean {
    setTimeout(() => {
      this.toastService.remove(toast);
    }, toast.delay || 3000);
    return true;
  }
}