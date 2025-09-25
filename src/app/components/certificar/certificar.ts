import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  COMPETENCIAS_25_MOCK,
  COMPETENCIAS_50_MOCK,
  COMPETENCIAS_75_MOCK,
  COMPETENCIAS_100_MOCK,
  Competencia
} from '../../models/certificacion.models';

// Datos temporales simples para pruebas
interface EmpleadoTemp {
  numero: string;
  nombre: string;
  linea: string;
  operacion: string;
  programa: string;
}

@Component({
  selector: 'app-certificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certificar.html',
  styleUrl: './certificar.css'
})
export class Certificar implements OnInit {
  // Signals para el estado del componente
  private readonly empleadoActual = signal<EmpleadoTemp | null>(null);
  private readonly modalAbierto = signal<number | null>(null);
  readonly competenciasSeleccionadas = signal<{[key: string]: boolean}>({});
  private readonly cargandoGuardado = signal(false);

  // Form reactivo
  certificacionForm!: FormGroup;
  
  // Datos temporales simples (solo los 2 empleados que solicitas)
  readonly empleadosTemp: EmpleadoTemp[] = [
    { 
      numero: '6685', 
      nombre: 'Juan Gerardo Alcantar',
      linea: '',
      operacion: '', 
      programa: ''
    },
    { 
      numero: '7218', 
      nombre: 'Nestor Daniel Cabrera Garcia',
      linea: '',
      operacion: '', 
      programa: ''
    }
  ];

  // Datos temporales para los dropdowns
  readonly lineasDisponibles = [
    'Línea 1 - Ensamble Principal',
    'Línea 2 - Soldadura Especializada',
    'Línea 3 - Pintura y Acabado',
    'Línea 4 - Control de Calidad',
    'Línea 5 - Empaque y Distribución',
    'Línea 6 - Corte y Preparación'
  ];

  readonly operacionesDisponibles = [
    'Operación A - Corte de Materiales',
    'Operación B - Ensamble de Componentes',
    'Operación C - Soldadura de Piezas',
    'Operación D - Control de Calidad',
    'Operación E - Pintura y Acabado',
    'Operación F - Empaque Final',
    'Operación G - Inspección Técnica'
  ];

  readonly programasDisponibles = [
    'Programa Básico - Nivel 1',
    'Programa Intermedio - Nivel 2',
    'Programa Avanzado - Nivel 3',
    'Programa Especializado - Nivel 4',
    'Programa Master - Nivel 5'
  ];

  // Competencias por porcentaje
  readonly competenciasPorPorcentaje: {[key: number]: Competencia[]} = {
    25: [...COMPETENCIAS_25_MOCK],
    50: [...COMPETENCIAS_50_MOCK],
    75: [...COMPETENCIAS_75_MOCK],
    100: [...COMPETENCIAS_100_MOCK]
  };

  // Computed para obtener el empleado actual
  readonly datosEmpleado = computed(() => this.empleadoActual());
  readonly modalActivo = computed(() => this.modalAbierto());
  readonly guardando = computed(() => this.cargandoGuardado());

  constructor(private fb: FormBuilder) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    // Configurar la fecha automática al día de hoy
    this.certificacionForm.patchValue({
      fechaEvaluacion: this.obtenerFechaHoy()
    });
  }

  private inicializarFormulario(): void {
    this.certificacionForm = this.fb.group({
      numeroEmpleado: ['', [
        Validators.required, 
        Validators.pattern(/^\d{4}$/),
        Validators.maxLength(4)
      ]],
      nombre: [{value: '', disabled: true}],
      linea: ['', Validators.required],
      operacion: ['', Validators.required],
      programa: ['', Validators.required],
      fechaEvaluacion: [{value: '', disabled: true}, Validators.required]
    });

    // Escuchar cambios en el número de empleado
    this.certificacionForm.get('numeroEmpleado')?.valueChanges.subscribe(numero => {
      this.buscarEmpleado(numero);
    });
  }

  private obtenerFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  private buscarEmpleado(numero: string): void {
    if (numero && numero.length === 4) {
      const empleado = this.empleadosTemp.find(emp => emp.numero === numero);
      if (empleado) {
        this.empleadoActual.set(empleado);
        this.certificacionForm.patchValue({
          nombre: empleado.nombre
          // No auto-llenamos línea, operación ni programa
        });
      } else {
        this.limpiarDatosEmpleado();
      }
    } else {
      this.limpiarDatosEmpleado();
    }
  }

  private limpiarDatosEmpleado(): void {
    this.empleadoActual.set(null);
    this.certificacionForm.patchValue({
      nombre: ''
      // Mantenemos los valores seleccionados de línea, operación y programa
    });
  }

  abrirModal(porcentaje: number): void {
    if (!this.empleadoActual()) {
      alert('Debe seleccionar un empleado válido antes de certificar');
      return;
    }
    this.modalAbierto.set(porcentaje);
    // Inicializar competencias si no existen
    const competencias = this.competenciasPorPorcentaje[porcentaje];
    const competenciasActuales = this.competenciasSeleccionadas();
    competencias.forEach(comp => {
      if (!(comp.id in competenciasActuales)) {
        this.competenciasSeleccionadas.set({
          ...competenciasActuales,
          [comp.id]: false
        });
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(null);
  }

  toggleCompetencia(competenciaId: string): void {
    const actual = this.competenciasSeleccionadas();
    this.competenciasSeleccionadas.set({
      ...actual,
      [competenciaId]: !actual[competenciaId]
    });
  }

  verificarCompetenciasCompletas(porcentaje: number): boolean {
    const competencias = this.competenciasPorPorcentaje[porcentaje];
    const seleccionadas = this.competenciasSeleccionadas();
    return competencias.every(comp => seleccionadas[comp.id] === true);
  }

  async certificarEmpleado(porcentaje: number): Promise<void> {
    if (!this.verificarCompetenciasCompletas(porcentaje)) {
      alert('Debe completar todas las competencias antes de certificar');
      return;
    }

    this.cargandoGuardado.set(true);
    
    try {
      // Simular llamada a API
      await this.simularGuardadoCertificacion(porcentaje);
      
      alert(`Empleado certificado exitosamente al ${porcentaje}%`);
      this.cerrarModal();
      this.reiniciarFormulario();
      
    } catch (error) {
      alert('Error al guardar la certificación. Intente nuevamente.');
      console.error('Error:', error);
    } finally {
      this.cargandoGuardado.set(false);
    }
  }

  private async simularGuardadoCertificacion(porcentaje: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const empleado = this.empleadoActual();
        const formValues = this.certificacionForm.value;
        if (empleado) {
          const certificacion = {
            numeroEmpleado: empleado.numero,
            nombre: empleado.nombre,
            linea: formValues.linea,
            operacion: formValues.operacion,
            programa: formValues.programa,
            fechaEvaluacion: new Date(formValues.fechaEvaluacion),
            porcentajeCertificacion: porcentaje,
            fechaCreacion: new Date()
          };
          
          // Aquí se enviaría al backend
          console.log('Certificación guardada:', certificacion);
        }
        resolve();
      }, 1500);
    });
  }

  private reiniciarFormulario(): void {
    this.certificacionForm.reset();
    this.certificacionForm.patchValue({
      fechaEvaluacion: this.obtenerFechaHoy()
    });
    this.empleadoActual.set(null);
    this.competenciasSeleccionadas.set({});
  }

  // Getters para el template
  get numeroEmpleadoValido(): boolean {
    const control = this.certificacionForm.get('numeroEmpleado');
    return !!(control && control.valid && control.value && this.empleadoActual());
  }

  get formularioCompleto(): boolean {
    return this.numeroEmpleadoValido && 
           !!this.certificacionForm.get('linea')?.value &&
           !!this.certificacionForm.get('operacion')?.value &&
           !!this.certificacionForm.get('programa')?.value;
  }

  get puedeIniciarCertificacion(): boolean {
    return this.formularioCompleto && !this.guardando();
  }

  // Métodos para el template
  onNumeroEmpleadoInput(event: any): void {
    const valor = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = valor;
    this.certificacionForm.patchValue({ numeroEmpleado: valor });
  }

  getCompetenciasCompletadas(porcentaje: number): number {
    const competencias = this.competenciasPorPorcentaje[porcentaje];
    const seleccionadas = this.competenciasSeleccionadas();
    return competencias.filter(comp => seleccionadas[comp.id] === true).length;
  }

  getPorcentajeProgreso(porcentaje: number): number {
    const total = this.competenciasPorPorcentaje[porcentaje].length;
    const completadas = this.getCompetenciasCompletadas(porcentaje);
    return (completadas / total) * 100;
  }
}
