import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../lista-productos/lista-productos.component';
import { ProductoService } from '../../../../core/services/producto.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  // IMPORTANTE: Agregamos ReactiveFormsModule para que funcione el control del formulario
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './formulario-producto.component.html',
  styleUrl: './formulario-producto.component.css'
})
export class FormularioProductoComponent implements OnInit, OnChanges {

  @Input() productoAEditar: Producto | null = null;
  @Output() alGuardarExitoso = new EventEmitter<void>();

  productoForm!: FormGroup;
  esEdicion: boolean = false;

  private platformId = inject(PLATFORM_ID);

  // Inyectamos FormBuilder para construir nuestra estructura de datos de forma limpia
  constructor(private fb: FormBuilder,
    private productoService: ProductoService,
    private toastService: ToastService
  ) {}

  productoSeleccionado: Producto | null = null;

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoAEditar'] && this.productoForm) {
      this.evaluarModoFormulario();
    }
  }

  inicializarFormulario(): void {
    this.productoForm = this.fb.group({
      // Clave: Obligatoria, alfanumérica y máximo 10 caracteres
      claveProducto: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z0-9-]+$')]],
      // Nombre: Obligatorio y máximo 200 caracteres
      nombreProducto: ['', [Validators.required, Validators.maxLength(200)]],
      // Precio: Obligatorio, mínimo 0.01 y debe ser un número válido
      precio: ['', [Validators.required, Validators.min(0.01), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      // Usuario Auditor: Lo simulamos por ahora, en producción vendría del token JWT descifrado
      usuarioAuditor: ['crystian.dev', [Validators.required]]
    });
    this.evaluarModoFormulario();
  }

  // Métodos "Getters" para facilitar la lectura de errores en el HTML
  get f() { return this.productoForm.controls; }

  guardar(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched(); // Activa visualmente los errores si el usuario intenta enviar en blanco
      return;
    }

    // Aquí capturamos el objeto JSON listo para ser enviado mediante HTTP a tu Spring Boot
    const datosProducto = this.productoForm.getRawValue();
    if (this.esEdicion) {
      console.log('Disparar http.put al backend para actualizar:', datosProducto);
      this.productoService.actualizarProducto(this.productoAEditar!.id, datosProducto).subscribe({
        next: (response) => {
          //console.log('Producto actualizado exitosamente:', response);
          this.toastService.showSuccess('Catálogo Actualizado', 'Producto modificado con éxito.');
          this.alGuardarExitoso.emit();
          this.cerrarModal();
        }
      });

    } else {   

    const nuevoProducto = this.productoForm.value;
    console.log('Objeto listo para enviar al Backend:', nuevoProducto);
    this.productoService.crearProducto(nuevoProducto).subscribe({
      next: (response) => {
        //console.log('Producto creado exitosamente:', response);
        this.alGuardarExitoso.emit();
        this.toastService.showSuccess('Catálogo Actualizado', 'El producto se ha creado con éxito.');
      },
      error: (err) => {
        console.error('Error al crear el producto:', err);
        this.toastService.showError('Error de Sistema', 'No se pudo procesar la creación del producto.');
      }
    });
  }

    this.productoForm.reset({ usuarioAuditor: 'crystian.dev' }); // Reinicia el formulario
    this.alGuardarExitoso.emit();
    this.cerrarModal();

  }

  cerrarModal(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Buscamos el contenedor del modal usando el ID exacto que le pusimos en el HTML de la lista
      const modalElement = document.getElementById('modalRegistroProducto');
      
      if (modalElement) {
        // 2. Traemos de forma dinámica la librería global de Bootstrap que cargamos en angular.json
        const bootstrap = (window as any).bootstrap;
        
        if (bootstrap) {
          // 3. Obtenemos la instancia activa del modal o creamos una basada en su ID
          const modalInstancia = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          
          // 4. Le ordenamos al modal que se oculte físicamente de la pantalla
          modalInstancia.hide();
          
          // 5. Opcional: Reseteamos el formulario para que la próxima vez que se abra esté limpio
          this.productoForm.reset({ usuarioAuditor: 'crystian.dev' });
        }
      }
    }
    }

  evaluarModoFormulario(): void {
    if (this.productoAEditar) {
      this.esEdicion = true;
      // patchValue "mapea" y rellena mágicamente todo el formulario con los datos del producto
      this.productoForm.patchValue(this.productoAEditar);
      // La clave del producto no debería editarse por reglas de auditoría, la bloqueamos:
      this.productoForm.get('claveProducto')?.disable();
    } else {
      this.esEdicion = false;
      this.productoForm.reset({ usuarioAuditor: 'crystian.dev' });
      this.productoForm.get('claveProducto')?.enable();
    }
}

}