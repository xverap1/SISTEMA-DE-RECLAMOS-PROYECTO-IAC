import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { FiltrosBusquedaComponent, FiltrosValues } from '../../../shared/components/filtros-busqueda/filtros-busqueda.component';
import { PaginacionComponent } from '../../../shared/components/paginacion/paginacion.component';
import * as XLSX from 'xlsx'; // <- Importamos la librería de Excel
import { ProductoService } from '../../../../core/services/producto.service';
import { FormBuilder } from '@angular/forms';
import { ReporteResponseDto } from '../../../../data/interfaces/producto.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HistorialAuditoriaComponent } from "../../../shared/components/historial-auditoria/historial-auditoria.component";

// Definimos la interfaz idéntica a tu diseño de base de datos
export interface Producto {
  id: number;
  folioNegocio: string;
  claveProducto: string;
  nombreProducto: string;
  precio: number;
  activo: boolean;
  fechaRegistro: string;
  usuarioAuditor: string;
}

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormularioProductoComponent, FiltrosBusquedaComponent, PaginacionComponent, HistorialAuditoriaComponent],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {

    constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private toastService: ToastService,
    public authService: AuthService,
  ) {}

  // Arreglo de productos para renderizar en la tabla
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;

  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];

  paginaActual: number = 1;
  itemsPorPagina: number = 10;

  filtrosActuales: FiltrosValues = { nombre: '', clave: '', precioMin: null, precioMax: null };

  ngOnInit(): void {
    //this.cargarProductosSimulados();
    
    this.obtenerProductos();
    this.procesarPipeline();
  }

  cargarProductosSimulados(): void {
    this.productos = [
      {
        id: 1,
        folioNegocio: 'PROD-20260527-123456',
        claveProducto: 'LAP-M3-01',
        nombreProducto: 'Laptop Apple MacBook Air M3 16GB RAM 512GB SSD',
        precio: 27999.00,
        activo: true,
        fechaRegistro: '2026-05-27T10:31:32',
        usuarioAuditor: 'crystian.dev'
      },
      {
        id: 2,
        folioNegocio: 'PROD-20260527-123499',
        claveProducto: 'MON-4K-27',
        nombreProducto: 'Monitor Gamer ASUS 27" 4K UHD 144Hz IPS',
        precio: 8499.50,
        activo: true,
        fechaRegistro: '2026-05-27T11:15:00',
        usuarioAuditor: 'crystian.dev'
      },
      {
        id: 3,
        folioNegocio: 'PROD-20260526-091512',
        claveProducto: 'KEY-ME-05',
        nombreProducto: 'Teclado Mecánico Logitech G Pro X Switch Blue (Descontinuado)',
        precio: 1899.00,
        activo: false, // Producto inactivo para probar el badge rojo
        fechaRegistro: '2026-05-26T09:15:12',
        usuarioAuditor: 'admin.auditor'
      }
    ];
  }

  exportarProductos(): void {
    // Le pasamos al servicio la lista de productos que actualmente están filtrados en pantalla
    this.productoService.exportarAExcel(this.productosFiltrados).subscribe({
      next: (response: ReporteResponseDto) => {
        if (response.status === 200 && response.fileBase64) {
          
          // 🌟 TRUCO CLIENT-SIDE: Convertimos la cadena Base64 de vuelta a un archivo binario (Blob)
          const byteCharacters = atob(response.fileBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          
          // Creamos el archivo binario en la memoria del navegador indicando el formato oficial de Excel
          const blob = new Blob([byteArray], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });

          // Creamos un link flotante temporal en el navegador para disparar la descarga
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.fileName; // Usamos el nombre sugerido que mandó la BD ("productos.xlsx")
          document.body.appendChild(a);
          a.click(); // Forzamos el clic automático de descarga
          
          // Limpiamos la memoria del navegador borrando el link temporal
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          console.log(response.message); // "Reporte generado correctamente"
        } else {
          alert('No se pudo procesar el archivo enviado por el servidor.');
        }
      },
      error: (err) => {
        console.error('Error al exportar el catálogo de productos:', err);
        alert('Hubo un error al conectar con el servicio de exportación.');
      }
    });
  }

  exportarAExcel() : void {
    if (this.productos.length === 0) {
      alert('No hay datos disponibles para exportar.');
      return;
    }

    // 1. Mapeamos y formateamos los datos para el reporte final
    const datosParaReporte = this.productosFiltrados.map(p => ({
      'Folio de Negocio': p.folioNegocio,
      'Clave': p.claveProducto.toUpperCase(),
      'Descripción del Producto': p.nombreProducto,
      'Precio ($)': p.precio,
      'Estatus': p.activo ? 'ACTIVO' : 'INACTIVO',
      'Fecha de Registro': p.fechaRegistro,
      'Auditor': p.usuarioAuditor
    }));

    // 2. Creamos la hoja de trabajo (Worksheet) a partir del JSON formateado
    const hojaDeTrabajo = XLSX.utils.json_to_sheet(datosParaReporte);

    // 3. Creamos el libro de trabajo (Workbook) que contendrá la hoja
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Productos');

    // 4. Disparamos la descarga física del archivo en el navegador
    const nombreArchivo = `Reporte_Catalogo_Productos_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  }

  editarProducto(producto: Producto): void {
    console.log("🚀 ~ ListaProductosComponent ~ editarProducto ~ Producto:", producto);
    this.productoSeleccionado = producto;
  }

  prepararNuevoProducto(): void {
    console.log('Preparando formulario para nuevo producto...');
  this.productoSeleccionado = null;
}

desactivarProducto1(producto: Producto | null): void {
  if (producto) {
    producto.activo = false;
  }
  console.log('se desactivo el producto:', producto);
}

desactivarProducto(producto: Producto | null): void {
      
      // 1. 🛡️ EXTRAEMOS EL USUARIO DEL LOGEO: 
      // Recuperamos el objeto del localStorage que guardamos al iniciar sesión
      const sessionDataName = localStorage.getItem('usuario_username'); 
      let usuarioLogueado = 'SistemaAutomático'; // Valor por defecto por seguridad

      if (sessionDataName) {
        //const usuarioObj = JSON.parse(sessionData);
        // Extraemos el username (ej. crystian.dev) para la bitácora de auditoría
        usuarioLogueado = sessionDataName || 'UsuarioDesconocido'; 
      }

      // 2. INVOCAMOS AL SERVICIO: Pasamos el ID y la firma del auditor
      this.productoService.desactivarProducto(producto?.id!, usuarioLogueado).subscribe({
        next: (mensajeExito: string) => {
          this.toastService.showSuccess('Auditoría Completa', 'El producto ha sido desactivado correctamente')
          
          // Refrescamos la tabla local para que desaparezca el producto o cambie su estatus
          this.obtenerProductos(); 
        },
        error: (err) => {
          console.error('Error en la auditoría de desactivación:', err);
          this.toastService.showError('Error de Sistema', 'No se pudo procesar la baja del producto.');
        }
      });
    
  }

procesarPipeline(): void {
    // Extraemos los valores que vienen de las 4 cajitas del componente hijo
    const { nombre, clave, precioMin, precioMax } = this.filtrosActuales;

    // A) FILTRADO: Evaluamos registro por registro de la lista original
    this.productosFiltrados = this.productos.filter(p => {
      
      // Filtro 1: Nombre o Descripción (Hacemos toLowerCase para ignorar mayúsculas/minúsculas)
      // ⚠️ Ojo aquí: validamos si 'nombre' tiene texto, y comparamos contra 'p.nombreProducto'
      const cumpleNombre = !nombre || 
        p.nombreProducto.toLowerCase().includes(nombre.toLowerCase());

      // Filtro 2: Clave del Producto
      const cumpleClave = !clave || 
        p.claveProducto.toLowerCase().includes(clave.toLowerCase());

      // Filtro 3: Precio Mínimo
      const cumplePrecioMin = precioMin === null || precioMin === undefined || 
        p.precio >= precioMin;

      // Filtro 4: Precio Máximo
      const cumplePrecioMax = precioMax === null || precioMax === undefined || 
        p.precio <= precioMax;

      // El producto pasa si cumple las 4 condiciones al mismo tiempo
      return cumpleNombre && cumpleClave && cumplePrecioMin && cumplePrecioMax;
    });

    // B) PAGINACIÓN: Una vez filtrados, calculamos qué rebanada mostrar en la tabla
    const indiceInicial = (this.paginaActual - 1) * this.itemsPorPagina;
    this.productosPaginados = this.productosFiltrados.slice(indiceInicial, indiceInicial + this.itemsPorPagina);
  }

  /**
   * Captura el evento del componente hijo de filtros
   */
  onFiltrosCambiados(nuevosFiltros: FiltrosValues): void {
    this.filtrosActuales = nuevosFiltros;
    this.paginaActual = 1; // Reseteamos a página 1 al buscar
    this.procesarPipeline();
  }

  /**
   * Captura el evento del componente hijo de paginación
   */
  onPaginaCambiada(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.procesarPipeline();
  }

  obtenerProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (productos) => {
        console.log("🚀 ~ ListaProductosComponent ~ obtenerProductos ~ productos:", productos)
        this.productos = productos;
        this.procesarPipeline();
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
      }
    });
  }

}