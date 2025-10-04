//=================[Importaciones]=========
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

//=================[Componente Login]=========
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  //=================[Propiedades]=========
  loginForm!: FormGroup;
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.initializeForm();
  }

  //=================[Inicialización del Formulario]=========
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  //=================[Manejo del Formulario]=========
  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) { this.markAllFieldsAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { identifier, password } = this.loginForm.value;
    try {
      const resp: any = await this.auth.login(identifier, password).toPromise();
      if (!resp?.token || !resp?.user) {
        this.errorMessage.set('Respuesta de login inválida.');
        return;
      }
      this.auth.startSession({ token: resp.token, user: resp.user, capabilities: resp.capabilities, modules: resp.modules });
      // Fetch user to confirm session if needed
      try { await this.auth.getUser().toPromise(); } catch {}

      // Navegación basada en modules/capabilities
      const modules = resp.modules || [];
      if (modules.includes('aprobaciones')) {
        await this.router.navigate(['/home']);
      } else {
        await this.router.navigate(['/certificaciones']);
      }
    } catch (e: any) {
  if (e?.status === 401) this.errorMessage.set('Credenciales inválidas.');
  else if (e?.status === 403) this.errorMessage.set('Usuario deshabilitado.');
  else this.errorMessage.set('Error de conexión con el servidor. Verifica que la API esté accesible desde el emulador (10.0.2.2:8000) o tu IP LAN y vuelve a intentar.');
    } finally {
      this.isLoading.set(false);
    }
  }

  //=================[Utilidades del Formulario]=========
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  //=================[Utilidades UI]=========
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  //=================[Validaciones Genéricas]=========
  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  protected getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control || !control.errors) return '';

    const fieldLabels: Record<string, string> = {
      identifier: 'número de empleado o correo',
      password: 'contraseña'
    };

  const label = fieldLabels[fieldName] || fieldName;
  const minLengths: Record<string, number> = { identifier: 3, password: 6 };

    if (control.errors['required']) {
      return `${label.charAt(0).toUpperCase() + label.slice(1)} es requerido`;
    }
    
    // Permitimos número de empleado o correo; la validación de formato se hace en el backend
    if (control.errors['minlength']) {
      const requiredLength = minLengths[fieldName] || 1;
      return `${label.charAt(0).toUpperCase() + label.slice(1)} debe tener al menos ${requiredLength} caracteres`;
    }

    return '';
  }
}