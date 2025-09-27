//=================[Importaciones]=========
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    this.initializeForm();
  }

  //=================[Inicialización del Formulario]=========
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [
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
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      try {
        // Simular llamada API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { username, password } = this.loginForm.value;
        
        // Simular validación de credenciales
        if (username === 'admin' && password === 'admin123') {
          await this.router.navigate(['/certificaciones']);
        } else {
          this.errorMessage.set('Credenciales inválidas. Intenta de nuevo.');
        }
      } catch (error) {
        this.errorMessage.set('Error de conexión. Por favor, intenta más tarde.');
        console.error('Error en login:', error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markAllFieldsAsTouched();
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
      username: 'usuario',
      password: 'contraseña'
    };

    const label = fieldLabels[fieldName] || fieldName;
    const minLengths: Record<string, number> = {
      username: 3,
      password: 6
    };

    if (control.errors['required']) {
      return `${label.charAt(0).toUpperCase() + label.slice(1)} es requerido`;
    }
    
    if (control.errors['minlength']) {
      const requiredLength = minLengths[fieldName] || 1;
      return `${label.charAt(0).toUpperCase() + label.slice(1)} debe tener al menos ${requiredLength} caracteres`;
    }

    return '';
  }
}