import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamosAuthService } from '../../../../core/services/reclamos-auth.service';
import { ToastService } from '../../../../core/services/toast.service';

type Vista = 'login' | 'registro' | 'confirmar';

@Component({
  selector: 'app-login-ciudadano',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-ciudadano.component.html',
  styleUrl: './login-ciudadano.component.css',
})
export class LoginCiudadanoComponent {
  vista: Vista = 'login';
  isLoading = false;

  loginForm: FormGroup;
  registroForm: FormGroup;
  confirmarForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reclamosAuth: ReclamosAuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      telefono: [''],
    });

    this.confirmarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      codigo: ['', [Validators.required]],
    });
  }

  cambiarVista(vista: Vista): void {
    this.vista = vista;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.reclamosAuth.login(email, password).then(
      () => {
        this.isLoading = false;
        this.router.navigate(['/reclamos']);
      },
      (err) => {
        this.isLoading = false;
        this.toastService.showError('Acceso denegado', err.message || 'Correo o contraseña incorrectos.');
      }
    );
  }

  onRegistro(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { nombre, email, password, telefono } = this.registroForm.value;

    this.reclamosAuth.registrar(nombre, email, password, telefono || undefined).then(
      () => {
        this.isLoading = false;
        this.toastService.showSuccess('Cuenta creada', 'Te enviamos un código de verificación a tu correo.');
        this.confirmarForm.patchValue({ email });
        this.vista = 'confirmar';
      },
      (err) => {
        this.isLoading = false;
        this.toastService.showError('No se pudo registrar', err.message || 'Intenta con otro correo.');
      }
    );
  }

  onConfirmar(): void {
    if (this.confirmarForm.invalid) {
      this.confirmarForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { email, codigo } = this.confirmarForm.value;

    this.reclamosAuth.confirmarRegistro(email, codigo).then(
      () => {
        this.isLoading = false;
        this.toastService.showSuccess('Cuenta verificada', 'Ya puedes iniciar sesión.');
        this.loginForm.patchValue({ email });
        this.vista = 'login';
      },
      (err) => {
        this.isLoading = false;
        this.toastService.showError('Código inválido', err.message || 'Verifica el código e intenta de nuevo.');
      }
    );
  }
}
