import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionHistorial, CERTIFICACIONES_HISTORIAL_MOCK } from '../../models/certificacion.models';

// Datos temporales de empleados (mismos que certificar)
interface EmpleadoTemp {
  numero: string;
  nombre: string;
}

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certificaciones.html',
  styleUrl: './certificaciones.css'
})
export class Certificaciones implements OnInit {
  // Signals para el estado del componente
  private readonly empleadoActual = signal<EmpleadoTemp | null>(null);
  private readonly certificacionesEmpleado = signal<CertificacionHistorial[]>([]);
  private readonly filtroLineaActiva = signal<string>('todas');

  // Form reactivo
  busquedaForm!: FormGroup;

  // Datos temporales (mismos empleados)
  readonly empleadosTemp: EmpleadoTemp[] = [
    { numero: '6685', nombre: 'Juan Gerardo Alcantar' },
    { numero: '7218', nombre: 'Nestor Daniel Cabrera Garcia' }
  ];

  // Todas las certificaciones mock
  readonly todasCertificaciones = CERTIFICACIONES_HISTORIAL_MOCK;

  // Computed para obtener datos filtrados
  readonly datosEmpleado = computed(() => this.empleadoActual());
  readonly certificaciones = computed(() => this.certificacionesEmpleado());
  readonly filtroLinea = computed(() => this.filtroLineaActiva());

  // Computed para obtener líneas únicas del empleado actual
  readonly lineasDisponibles = computed(() => {
    const certs = this.certificacionesEmpleado();
    const lineas = [...new Set(certs.map(cert => cert.linea))].sort();
    return lineas;
  });

  // Computed para certificaciones filtradas
  readonly certificacionesFiltradas = computed(() => {
    const certs = this.certificacionesEmpleado();
    const filtro = this.filtroLineaActiva();
    
    if (filtro === 'todas') {
      return certs;
    }
    
    return certs.filter(cert => cert.linea === filtro);
  });

  // Computed para estadísticas
  readonly estadisticas = computed(() => {
    const certs = this.certificacionesFiltradas();
    return {
      total: certs.length,
      porcentaje25: certs.filter(c => c.porcentajeCertificacion === 25).length,
      porcentaje50: certs.filter(c => c.porcentajeCertificacion === 50).length,
      porcentaje75: certs.filter(c => c.porcentajeCertificacion === 75).length,
      porcentaje100: certs.filter(c => c.porcentajeCertificacion === 100).length,
      promedio: certs.length > 0 ? Math.round(certs.reduce((sum, c) => sum + c.porcentajeCertificacion, 0) / certs.length) : 0
    };
  });

  constructor(private fb: FormBuilder) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    // Componente listo
  }

  private inicializarFormulario(): void {
    this.busquedaForm = this.fb.group({
      numeroEmpleado: ['', [
        Validators.required,
        Validators.pattern(/^\d{4}$/),
        Validators.maxLength(4)
      ]],
      nombre: [{ value: '', disabled: true }]
    });

    // Escuchar cambios en el número de empleado
    this.busquedaForm.get('numeroEmpleado')?.valueChanges.subscribe(numero => {
      this.buscarEmpleado(numero);
    });
  }

  private buscarEmpleado(numero: string): void {
    if (numero && numero.length === 4) {
      const empleado = this.empleadosTemp.find(emp => emp.numero === numero);
      if (empleado) {
        this.empleadoActual.set(empleado);
        this.busquedaForm.patchValue({
          nombre: empleado.nombre
        });
        this.cargarCertificaciones(numero);
      } else {
        this.limpiarDatos();
      }
    } else {
      this.limpiarDatos();
    }
  }

  private cargarCertificaciones(numeroEmpleado: string): void {
    const certificaciones = this.todasCertificaciones
      .filter(cert => cert.numeroEmpleado === numeroEmpleado)
      .sort((a, b) => b.fechaCertificacion.getTime() - a.fechaCertificacion.getTime());
    
    this.certificacionesEmpleado.set(certificaciones);
    this.filtroLineaActiva.set('todas');
  }

  private limpiarDatos(): void {
    this.empleadoActual.set(null);
    this.certificacionesEmpleado.set([]);
    this.filtroLineaActiva.set('todas');
    this.busquedaForm.patchValue({
      nombre: ''
    });
  }

  // Métodos para el template
  onNumeroEmpleadoInput(event: any): void {
    const valor = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = valor;
    this.busquedaForm.patchValue({ numeroEmpleado: valor });
  }

  filtrarPorLinea(linea: string): void {
    this.filtroLineaActiva.set(linea);
  }

  obtenerClasePorcentaje(porcentaje: number): string {
    switch (porcentaje) {
      case 25: return 'badge-25';
      case 50: return 'badge-50';
      case 75: return 'badge-75';
      case 100: return 'badge-100';
      default: return 'badge-secondary';
    }
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(fechaObj);
  }

  // Getters para el template
  get numeroEmpleadoValido(): boolean {
    const control = this.busquedaForm.get('numeroEmpleado');
    return !!(control && control.valid && control.value && this.empleadoActual());
  }

  get tieneCertificaciones(): boolean {
    return this.certificaciones().length > 0;
  }

  contarCertificacionesPorLinea(linea: string): number {
    return this.certificaciones().filter(c => c.linea === linea).length;
  }
}
