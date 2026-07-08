import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Inicializamos el formulario con sus validaciones básicas
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]]
    });
    
    // Por si acaso, limpiamos cualquier sesión vieja al entrar al login
    this.authService.logout();
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Consumimos nuestro servicio inyectado
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('¡Login Exitoso! Token almacenado:', response.access_token);
        
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en la autenticación:', err);
        this.toastService.showError(
          'Acceso Denegado', 
          'Usuario o contraseña incorrectos. Por favor, verifique sus datos institucionales.'
        );
        
        // Manejo amigable de errores según lo que responda tu Spring Boot
        if (err.status === 401) {
          this.errorMessage = 'El usuario o la contraseña son incorrectos.';
        } else {
          this.errorMessage = 'Por favor, verifique sus datos institucionales.';
        }
      }
    });
  }
}