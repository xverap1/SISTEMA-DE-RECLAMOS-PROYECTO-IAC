import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Definimos la estructura limpia de los valores que arrojará el filtro
export interface FiltrosValues {
  nombre: string;
  clave: string;
  precioMin: number | null;
  precioMax: number | null;
}

@Component({
  selector: 'app-filtros-busqueda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtros-busqueda.component.html'
})
export class FiltrosBusquedaComponent implements OnInit {

  // Evento de salida: Emite los valores cada vez que hay un cambio
  @Output() alFiltrar = new EventEmitter<FiltrosValues>();

  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      nombre: [''],
      clave: [''],
      precioMin: [null],
      precioMax: [null]
    });

    this.filterForm.valueChanges.subscribe((valores) => {
      this.alFiltrar.emit(valores);
    });
  }

  limpiarFiltros(): void {
    this.filterForm.reset();
  }
}