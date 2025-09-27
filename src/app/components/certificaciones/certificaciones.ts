//=================[Importaciones]=========
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionHistorial, PorcentajeCertificacion } from '../../models/certificacion.models';
import { CertificacionesService } from '../../services/certificaciones.service';

//=================[Interfaces]=========
interface EmpleadoTemp {
  numero: string;
  nombre: string;
}

interface CertificacionHistorialExt extends CertificacionHistorial { area?: string }

//=================[Componente Certificaciones]=========
@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certificaciones.html',
  styleUrl: './certificaciones.css'
})
export class Certificaciones implements OnInit {
  //=================[Signals de Estado]=========
  readonly empleadoActual = signal<EmpleadoTemp | null>(null);
  private readonly certificacionesEmpleado = signal<CertificacionHistorialExt[]>([]);
  private readonly filtroLineaActiva = signal<string>('todas');

  // Alias público para el template
  readonly filtroLinea = this.filtroLineaActiva;

  //=================[Formularios Reactivos]=========
  busquedaForm!: FormGroup;

  //=================[Datos Temporales]=========
  readonly empleadosTemp: EmpleadoTemp[] = [
    { numero: '6685', nombre: 'Juan Gerardo Alcantar' },
    { numero: '7218', nombre: 'Nestor Daniel Cabrera Garcia' }
  ];

  private readonly todasCertificaciones = signal<CertificacionHistorialExt[]>([]);

  //=================[Computed Properties]=========
  readonly lineasDisponibles = computed(() => {
    const certs = this.certificacionesEmpleado();
    const lineas = [...new Set(certs.map(cert => cert.linea))].sort();
    return lineas;
  });

  readonly certificacionesFiltradas = computed(() => {
    const certs = this.certificacionesEmpleado();
    const filtro = this.filtroLineaActiva();
    
    if (filtro === 'todas') {
      return certs;
    }
    
    return certs.filter(cert => cert.linea === filtro);
  });

  // Optimized statistics with single pass
  readonly estadisticas = computed(() => {
    const certs = this.certificacionesFiltradas();
    const total = certs.length;
    
    if (total === 0) {
      return {
        total: 0,
        porcentaje25: 0,
        porcentaje50: 0, 
        porcentaje75: 0,
        porcentaje100: 0,
        promedio: 0
      };
    }

    // Single pass optimization
    const stats = certs.reduce((acc, cert) => {
      acc.suma += cert.porcentajeCertificacion;
      switch (cert.porcentajeCertificacion) {
        case 25: acc.p25++; break;
        case 50: acc.p50++; break;
        case 75: acc.p75++; break;
        case 100: acc.p100++; break;
      }
      return acc;
    }, { suma: 0, p25: 0, p50: 0, p75: 0, p100: 0 });

    return {
      total,
      porcentaje25: stats.p25,
      porcentaje50: stats.p50,
      porcentaje75: stats.p75, 
      porcentaje100: stats.p100,
      promedio: Math.round(stats.suma / total)
    };
  });

  // Convert getters to computed for consistency
  readonly numeroEmpleadoValido = computed(() => {
    const control = this.busquedaForm?.get('numeroEmpleado');
    return !!(control && control.valid && control.value && this.empleadoActual());
  });

  readonly tieneCertificaciones = computed(() => 
    this.certificacionesEmpleado().length > 0
  );

  constructor(private fb: FormBuilder, private api: CertificacionesService) {
    this.inicializarFormulario();
  }

  //=================[Inicialización]=========
  ngOnInit(): void {
    
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

    this.busquedaForm.get('numeroEmpleado')?.valueChanges.subscribe(numero => {
      this.buscarEmpleado(numero);
    });
  }

  //=================[Búsqueda de Empleados]=========
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
        let mapped: CertificacionHistorialExt[] = arr
          .map((r: any) => this.mapRowToCert(r))
          .sort((a, b) => b.fechaCertificacion.getTime() - a.fechaCertificacion.getTime());
        
        // Fallback a datos mock si no hay datos de API
        if (mapped.length === 0 && numeroEmpleado === '6685') {
          mapped = this.getMockCertificaciones(numeroEmpleado);
        }
        
        this.todasCertificaciones.set(mapped);
        this.certificacionesEmpleado.set(mapped);
        this.filtroLineaActiva.set('todas');
      },
      error: (_error) => {
        // Fallback a datos mock en caso de error
        const mockData = numeroEmpleado === '6685' ? this.getMockCertificaciones(numeroEmpleado) : [];
        
        this.todasCertificaciones.set(mockData);
        this.certificacionesEmpleado.set(mockData);
        this.filtroLineaActiva.set('todas');
      }
    });
  }

  private getMockCertificaciones(numeroEmpleado: string): CertificacionHistorialExt[] {
    return [
      {
        id: '1',
        numeroEmpleado,
        nombre: 'Juan Gerardo Alcantar',
        area: 'A001 - Producción',
        linea: 'L001 - Línea 1',
        operacion: 'OP001 - Costura Básica',
        programa: 'PG001 - Programa Básico',
        porcentajeCertificacion: 100 as PorcentajeCertificacion,
        fechaCertificacion: new Date('2024-01-15'),
        entrenador: '1234 - Supervisor García',
        estado: 'Activa'
      },
      {
        id: '2',
        numeroEmpleado,
        nombre: 'Juan Gerardo Alcantar',
        area: 'A001 - Producción',
        linea: 'L001 - Línea 1',
        operacion: 'OP002 - Costura Intermedia',
        programa: 'PG002 - Programa Intermedio',
        porcentajeCertificacion: 75 as PorcentajeCertificacion,
        fechaCertificacion: new Date('2024-02-20'),
        entrenador: '1234 - Supervisor García',
        estado: 'Activa'
      },
      {
        id: '3',
        numeroEmpleado,
        nombre: 'Juan Gerardo Alcantar',
        area: 'A002 - Calidad',
        linea: 'L002 - Línea 2',
        operacion: 'OP003 - Control de Calidad',
        programa: 'PG003 - Programa Avanzado',
        porcentajeCertificacion: 50 as PorcentajeCertificacion,
        fechaCertificacion: new Date('2024-03-10'),
        entrenador: '5678 - Inspector Martínez',
        estado: 'Activa'
      }
    ];
  }

  private mapRowToCert(r: any): CertificacionHistorialExt {
    return {
      id: this.extractId(r),
      numeroEmpleado: String(r.employee_number ?? r.numeroEmpleado ?? r.employee_number ?? ''),
      nombre: String(r.user_name ?? r.nombre ?? r.employee_name ?? ''),
      area: this.extractArea(r),
      linea: this.extractLinea(r), 
      operacion: this.extractOperacion(r),
      programa: this.extractPrograma(r),
      porcentajeCertificacion: Number(r.porcentaje ?? r.porcentajeCertificacion ?? r.percent ?? 0) as PorcentajeCertificacion,
      fechaCertificacion: new Date(r.fecha_certificacion ?? r.fechaCertificacion ?? r.created_at ?? Date.now()),
      entrenador: this.extractEntrenador(r),
      estado: 'Activa'
    };
  }

  private extractId(r: any): string {
    return String(r.id ?? r.cert_id ?? r.certifier_id ?? r.certificacion_id ?? this.randomId());
  }

  private extractArea(r: any): string {
    const areaObj = r.area || {};
    const areaCode = areaObj.code || areaObj.codigo || areaObj.number_area || r.area_code || r.area_codigo || '';
    const areaName = areaObj.name || areaObj.nombre || r.area_name || r.area_nombre || r.area || '';
    return this.composeLabel(areaCode, areaName);
  }

  private extractLinea(r: any): string {
    const lineObj = r.line || r.linea || {};
    const lineCode = lineObj.code || lineObj.codigo || lineObj.number_line || r.line_code || r.linea_codigo || '';
    const lineName = lineObj.name || lineObj.nombre || r.line_name || r.linea_nombre || r.linea || '';
    return this.composeLabel(lineCode, lineName);
  }

  private extractOperacion(r: any): string {
    const op = r.operation || r.operacion || {};
    const opCode = op.number_operation || op.code || op.numero || '';
    const opName = op.name || op.nombre || '';
    return this.composeLabel(opCode, opName);
  }

  private extractPrograma(r: any): string {
    const op = r.operation || r.operacion || {};
    const progId = op.programa_id || op.program_id || r.programa_id || r.program_id || '';
    
    const programObj = r.program || r.programa || op.program || op.programa || {};
    const programCode = programObj.code || programObj.codigo || programObj.number_program || programObj.number || '';
    const programName = programObj.name || programObj.nombre || '';
    
    let programa = this.composeLabel(programCode, programName);
    if (!programa) {
      programa = this.composeLabel('', progId ? `PG${progId}` : '');
    }
    return programa;
  }

  private extractEntrenador(r: any): string {
    const trainerObj = (r.entrenador ?? r.trainer ?? r.user_trainer ?? null);
    
    if (trainerObj && typeof trainerObj === 'object') {
      const tName = trainerObj.name || trainerObj.nombre || '';
      const tNum = trainerObj.employee_number || trainerObj.numeroEmpleado || trainerObj.numero || '';
      return this.composeLabel(String(tNum), String(tName));
    } 
    
    if (typeof trainerObj === 'string') {
      return trainerObj;
    }
    
    const tName = r.trainer_name || r.user_trainer_name || r.nombre_entrenador || '';
    const tNum = r.trainer_employee_number || r.user_trainer_number || r.numero_entrenador || '';
    return this.composeLabel(String(tNum), String(tName));
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

  obtenerNombreLinea(linea: string): string {
    if (!linea) return '—';
    
    // Si contiene " - ", extraer la parte después del guión
    if (linea.includes(' - ')) {
      const partes = linea.split(' - ');
      return partes.length > 1 ? partes[1] : partes[0];
    }
    
    // Si no contiene " - ", devolver la línea completa
    return linea;
  }

  obtenerCodigoLinea(linea: string): string {
    if (!linea) return '';
    
    // Si contiene " - ", extraer la parte antes del guión
    if (linea.includes(' - ')) {
      const partes = linea.split(' - ');
      return partes.length > 1 ? partes[0] : '';
    }
    
    // Si no contiene " - ", no hay código
    return '';
  }

  formatearFecha(fecha: Date | string): string {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(fechaObj);
  }

  // Optimized method for counting certifications by line
  contarCertificacionesPorLinea(linea: string): number {
    return this.certificacionesEmpleado().filter(c => c.linea === linea).length;
  }
}
