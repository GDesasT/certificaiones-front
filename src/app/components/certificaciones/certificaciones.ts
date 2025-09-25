import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionHistorial } from '../../models/certificacion.models';
import { CertificacionesService } from '../../services/certificaciones.service';

// Datos temporales de empleados (mismos que certificar)
interface EmpleadoTemp {
  numero: string;
  nombre: string;
}

// Tipo extendido localmente para incluir 'area'
interface CertificacionHistorialExt extends CertificacionHistorial { area?: string }

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
  private readonly certificacionesEmpleado = signal<CertificacionHistorialExt[]>([]);
  private readonly filtroLineaActiva = signal<string>('todas');

  // Form reactivo
  busquedaForm!: FormGroup;

  // Datos temporales (deprecado, se usará API). Dejamos como fallback si API falla.
  readonly empleadosTemp: EmpleadoTemp[] = [
    { numero: '6685', nombre: 'Juan Gerardo Alcantar' },
    { numero: '7218', nombre: 'Nestor Daniel Cabrera Garcia' }
  ];

  // Fuente de datos: se llena desde API al buscar un empleado
  private readonly todasCertificaciones = signal<CertificacionHistorialExt[]>([]);

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

  constructor(private fb: FormBuilder, private api: CertificacionesService) {
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
    if (!numero || numero.length !== 4) { this.limpiarDatos(); return; }

    // Primero intentamos API real
    this.api.findUserByNumber(numero).subscribe({
      next: (user: any) => {
        if (user) {
          const empleado: EmpleadoTemp = { numero, nombre: user.name ?? user.nombre ?? '' };
          this.empleadoActual.set(empleado);
          this.busquedaForm.patchValue({ nombre: empleado.nombre });
          this.cargarCertificaciones(numero);
        } else {
          // Fallback a mock temporal si API no devuelve usuario
          const emp = this.empleadosTemp.find(e => e.numero === numero) || null;
          if (emp) {
            this.empleadoActual.set(emp);
            this.busquedaForm.patchValue({ nombre: emp.nombre });
            this.cargarCertificaciones(numero);
          } else {
            this.limpiarDatos();
          }
        }
      },
      error: _ => {
        // Fallback a mock
        const emp = this.empleadosTemp.find(e => e.numero === numero) || null;
        if (emp) {
          this.empleadoActual.set(emp);
          this.busquedaForm.patchValue({ nombre: emp.nombre });
          this.cargarCertificaciones(numero);
        } else {
          this.limpiarDatos();
        }
      }
    });
  }

  private cargarCertificaciones(numeroEmpleado: string): void {
    this.api.getCertificationsByEmployee(numeroEmpleado).subscribe({
      next: (rows: any[]) => {
        const arr = Array.isArray(rows) ? rows : [];
        const mapped: CertificacionHistorialExt[] = arr.map((r: any) => this.mapRowToCert(r))
          .sort((a, b) => b.fechaCertificacion.getTime() - a.fechaCertificacion.getTime());
        this.todasCertificaciones.set(mapped);
        this.certificacionesEmpleado.set(mapped);
        this.filtroLineaActiva.set('todas');
      },
      error: _ => {
        this.todasCertificaciones.set([]);
        this.certificacionesEmpleado.set([]);
        this.filtroLineaActiva.set('todas');
      }
    });
  }

  private mapRowToCert(r: any): CertificacionHistorialExt {
    // Campos anidados que viene en la respuesta compartida
    const op = r.operation || r.operacion || {};
    const opCode = op.number_operation || op.code || op.numero || '';
    const opName = op.name || op.nombre || '';
    const progId = op.programa_id || op.program_id || r.programa_id || r.program_id || '';

    // Programa: puede venir como objeto al nivel raíz o dentro de operation
    const programObj = r.program || r.programa || op.program || op.programa || {};
    const programCode = programObj.code || programObj.codigo || programObj.number_program || programObj.number || '';
    const programName = programObj.name || programObj.nombre || '';

  // Área y Línea (nuevos en API)
  const areaObj = r.area || {};
  const areaCode = areaObj.code || areaObj.codigo || areaObj.number_area || r.area_code || r.area_codigo || '';
  const areaName = areaObj.name || areaObj.nombre || r.area_name || r.area_nombre || r.area || '';
  const area = this.composeLabel(areaCode, areaName);

  const lineObj = r.line || r.linea || {};
  const lineCode = lineObj.code || lineObj.codigo || lineObj.number_line || r.line_code || r.linea_codigo || '';
  const lineName = lineObj.name || lineObj.nombre || r.line_name || r.linea_nombre || r.linea || '';
  const linea = this.composeLabel(lineCode, lineName);
    const operacion = this.composeLabel(opCode, opName);
    let programa = this.composeLabel(programCode, programName);
    if (!programa) {
      programa = this.composeLabel('', progId ? `PG${progId}` : '');
    }

    // Entrenador (puede venir como objeto, string o campos separados)
    const trainerObj = (r.entrenador ?? r.trainer ?? r.user_trainer ?? null);
    let entrenador = '';
    if (trainerObj && typeof trainerObj === 'object') {
      const tName = trainerObj.name || trainerObj.nombre || '';
      const tNum  = trainerObj.number_employee || trainerObj.employee_number || trainerObj.numeroEmpleado || trainerObj.numero || '';
      entrenador = this.composeLabel(String(tNum), String(tName));
    } else if (typeof trainerObj === 'string') {
      entrenador = trainerObj;
    } else {
      const tName = r.trainer_name || r.user_trainer_name || r.nombre_entrenador || '';
      const tNum  = r.trainer_number_employee || r.user_trainer_number || r.numero_entrenador || '';
      entrenador = this.composeLabel(String(tNum), String(tName));
    }

    return {
      id: String(r.id ?? r.cert_id ?? r.certifier_id ?? r.certificacion_id ?? this.randomId()),
      numeroEmpleado: String(r.number_employee ?? r.numeroEmpleado ?? r.employee_number ?? ''),
      nombre: String(r.user_name ?? r.nombre ?? r.employee_name ?? ''),
      area,
      linea,
      operacion,
      programa,
      porcentajeCertificacion: Number(r.porcentaje ?? r.porcentajeCertificacion ?? r.percent ?? 0),
      fechaCertificacion: new Date(r.fecha_certificacion ?? r.fechaCertificacion ?? r.created_at ?? Date.now()),
      entrenador,
      estado: 'Activa'
    };
  }

  private composeLabel(code: string, name: string): string {
    const c = (code || '').toString().trim();
    const n = (name || '').toString().trim();
    if (c && n) return `${c} - ${n}`;
    return c || n || '';
  }

  private randomId(): string {
    return 'r' + Math.random().toString(36).slice(2) + Date.now().toString(36);
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
