import { Component, OnInit } from '@angular/core';
import { AuditoriaService, AuditoriaProducto } from '../../../../core/services/auditoria.service';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../../core/services/producto.service';

@Component({
  selector: 'app-historial-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-2">
      <div *ngIf="cargando" class="text-center py-4">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Cargando bitácora...</span>
        </div>
        <p class="text-muted mt-2">Sincronizando bitácora institucional...</p>
      </div>

      <div *ngIf="!cargando && historial.length === 0" class="alert alert-light text-center border py-4">
        <i class="bi bi-info-circle text-secondary fs-3"></i>
        <p class="mb-0 mt-2 text-secondary">No se registran movimientos recientes en el catálogo.</p>
      </div>

      <div *ngIf="!cargando && historial.length > 0" 
           class="position-relative ps-4 ms-2 border-start border-2 border-secondary-subtle timeline-container">
        
        <div *ngFor="let log of historial" class="mb-4 position-relative timeline-item animate-fade-in">
          
          <div class="position-absolute rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
               style="width: 32px; height: 32px; left: -41px; top: 0px; z-index: 2;"
               [ngClass]="{
                 'bg-success': log.accion === 'CREACIÓN',
                 'bg-warning text-dark': log.accion === 'MODIFICACIÓN',
                 'bg-danger': log.accion === 'DESACTIVACIÓN'
               }">
            <i class="bi" [ngClass]="{
              'bi-plus-lg': log.accion === 'CREACIÓN',
              'bi-pencil-fill': log.accion === 'MODIFICACIÓN',
              'bi-trash3-fill': log.accion === 'DESACTIVACIÓN'
            }"></i>
          </div>

          <div class="card border-light shadow-sm bg-body">
            <div class="card-body p-3">
              
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge rounded-pill" [ngClass]="{
                  'bg-success-subtle text-success-emphasis border border-success-subtle': log.accion === 'CREACIÓN',
                  'bg-warning-subtle text-warning-emphasis border border-warning-subtle': log.accion === 'MODIFICACIÓN',
                  'bg-danger-subtle text-danger-emphasis border border-danger-subtle': log.accion === 'DESACTIVACIÓN'
                }">
                  {{ log.accion }}
                </span>
                <small class="text-muted fw-semibold">
                  <i class="bi bi-clock-history me-1"></i> {{ log.fechaMovimiento }}
                </small>
              </div>

              <h6 class="fw-bold mb-1 text-dark">{{ log.nombreProducto }}</h6>
              <div class="mb-2">
                <span class="badge bg-light text-secondary border fw-mono">Clave: {{ log.claveProducto }}</span>
                <span class="text-muted small ms-2">ID Registro: #{{ log.productoId }}</span>
              </div>

              <p class="mb-3 text-secondary-emphasis" style="font-size: 0.92rem; line-height: 1.4;">
                {{ log.detalles }}
              </p>

              <div class="border-top pt-2 d-flex align-items-center bg-light-subtle rounded-bottom">
                <span class="text-muted small">
                  <i class="bi bi-person-badge text-success me-1"></i> Responsable: 
                  <strong class="text-dark-emphasis">{{ log.usuarioAuditor }}</strong>
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .fw-mono { font-family: monospace; }
    //.timeline-container { max-height: 65vh; overflow-y: auto; padding-right: 5px; }
    .timeline-container { max-height: 65vh; padding-right: 5px; }
    /* Animación fluida para la aparición de las tarjetas */
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HistorialAuditoriaComponent implements OnInit {
  historial: AuditoriaProducto[] = [];
  cargando: boolean = true;

  constructor(private auditoriaService: AuditoriaService
  ) {}

  ngOnInit(): void {
    this.cargarBitacora();
  }

  cargarBitacora(): void {
    this.cargando = true;
    this.auditoriaService.obtenerHistorial().subscribe({
      next: (data: AuditoriaProducto[]) => {
        this.historial = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al mapear la bitácora de auditoría:', err);
        this.cargando = false;
      }
    });
  }
}