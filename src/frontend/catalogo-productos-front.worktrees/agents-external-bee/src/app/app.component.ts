import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './modules/shared/components/header/header.component';
import { ListaProductosComponent } from './modules/productos/pages/lista-productos/lista-productos.component';
import { FormularioProductoComponent } from './modules/productos/pages/formulario-producto/formulario-producto.component';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { ToastContainerComponent } from "./modules/shared/components/toast-container/toast-container.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ListaProductosComponent, LoginComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'catalogo-productos-front';
}
