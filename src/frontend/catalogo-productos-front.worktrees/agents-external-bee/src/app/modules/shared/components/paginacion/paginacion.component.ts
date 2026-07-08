import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.component.html'
})
export class PaginacionComponent implements OnChanges {
  // Entradas desde el padre
  @Input() paginaActual: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPorPagina: number = 10;

  // Salida hacia el padre: Emite el número de la nueva página seleccionada
  @Output() alCambiarPagina = new EventEmitter<number>();

  totalPaginas: number = 0;
  totalPaginasArray: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Cada vez que cambien los ítems o la configuración, recalculamos las páginas
    if (changes['totalItems'] || changes['itemsPorPagina']) {
      this.calcularPaginas();
    }
  }

  private calcularPaginas(): void {
    this.totalPaginas = Math.ceil(this.totalItems / this.itemsPorPagina);
    this.totalPaginasArray = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas && nuevaPagina !== this.paginaActual) {
      this.alCambiarPagina.emit(nuevaPagina); // Notificamos al padre
    }
  }
}