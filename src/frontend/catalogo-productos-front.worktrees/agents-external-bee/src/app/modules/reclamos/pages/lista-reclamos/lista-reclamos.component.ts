import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamoService } from '../../../../core/services/reclamo.service';
import { ReclamosAuthService } from '../../../../core/services/reclamos-auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Reclamo } from '../../../../data/interfaces/reclamo.interface';

@Component({
  selector: 'app-lista-reclamos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-reclamos.component.html',
  styleUrl: './lista-reclamos.component.css',
})
export class ListaReclamosComponent implements OnInit {
  reclamos: Reclamo[] = [];
  cargando = false;
  mostrandoFormulario = false;
  enviando = false;

  reclamoForm: FormGroup;

  readonly prioridades = ['BAJA', 'MEDIA', 'ALTA'];

  constructor(
    private fb: FormBuilder,
    private reclamoService: ReclamoService,
    public reclamosAuth: ReclamosAuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.reclamoForm = this.fb.group({
      tipoReclamo: ['', Validators.required],
      folioReferencia: ['', Validators.required],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required],
      prioridad: ['MEDIA', Validators.required],
      ubigeoIncidente: ['', Validators.required],
      direccionIncidente: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.reclamosAuth.estaAutenticado()) {
      this.router.navigate(['/reclamos/login']);
      return;
    }
    this.cargarReclamos();
  }

  cargarReclamos(): void {
    this.cargando = true;
    this.reclamoService.listar().subscribe({
      next: (res) => {
        this.reclamos = res.items;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.toastService.showError('Error', 'No se pudieron cargar tus reclamos.');
      },
    });
  }

  toggleFormulario(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
  }

  onCrearReclamo(): void {
    if (this.reclamoForm.invalid) {
      this.reclamoForm.markAllAsTouched();
      return;
    }
    this.enviando = true;

    this.reclamoService.crear(this.reclamoForm.value).subscribe({
      next: () => {
        this.enviando = false;
        this.toastService.showSuccess('Reclamo registrado', 'Tu reclamo fue enviado correctamente.');
        this.reclamoForm.reset({ prioridad: 'MEDIA' });
        this.mostrandoFormulario = false;
        this.cargarReclamos();
      },
      error: () => {
        this.enviando = false;
        this.toastService.showError('Error', 'No se pudo registrar el reclamo. Intenta de nuevo.');
      },
    });
  }

  cerrarSesion(): void {
    this.reclamosAuth.logout();
    this.router.navigate(['/reclamos/login']);
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'RESUELTO':
        return 'badge bg-success';
      case 'EN_PROCESO':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  }
}
