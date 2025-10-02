import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';

interface MatrizData {
  empleado: {
    numero: string;
    nombre: string;
    fechaIngreso: string;
    fechaCertificacion: string;
  };
  certificaciones: { [operacion: string]: number };
  detalles: { [operacion: string]: { firmas: { role: string; by?: string; date?: string }[]; requeridas: string[] } };
}

@Component({
  selector: 'app-matriz',
  imports: [CommonModule, FormsModule],
  templateUrl: './matriz.html',
  styleUrl: './matriz.css'
})
export class Matriz implements OnInit {
  private readonly svc = inject(CertificacionesService);
  // Roles de firma estándar a mostrar como columnas
  public readonly firmaRoles: string[] = ['mantenimiento','produccion','calidad'];
  
  // Cache para optimizar el rendimiento
  private registrosCache = signal<Array<{
    empleadoNumero: string;
    empleadoNombre: string;
    empleadoFechaIngreso: string;
    empleadoFechaCertificacion: string;
    linea: string;
    operacion: string;
    porcentaje: number;
    firmas?: { role: string; by?: string; date?: string }[];
    requeridas?: string[];
  }>>([]);
  private cacheTimestamp = signal<number>(0);
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Utilidades puras para mejor rendimiento y reutilización
  private static readonly obtenerClasePorcentaje = (porcentaje: number): string => {
    if (porcentaje === 0) return 'cert-none';
    if (porcentaje === 25) return 'cert-25';
    if (porcentaje === 50) return 'cert-50';  
    if (porcentaje === 75) return 'cert-75';
    if (porcentaje === 90) return 'cert-90';
    if (porcentaje === 100) return 'cert-100';
    return 'cert-none';
  };

  private static readonly formatearFecha = (fecha: string): string => {
    if (!fecha) return '';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fecha; // Si hay error, devolver la fecha original
    }
  };

  private static readonly formatearOperacion = (operacion: string): { codigo: string; nombre: string } => {
    const partes = operacion.split(' - ');
    return {
      codigo: partes[0],
      nombre: partes[1] || partes[0]
    };
  };

  private static readonly capitalize = (s: string): string => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Determinar si una certificación está totalmente aprobada: requiere TODAS las firmas exigidas
  private static readonly isFullyApproved = (raw: any): boolean => {
    if (!raw) return false;
    // Si backend marca explícitamente como aprobada, confiar en ello
    if (raw.fully_approved === true || raw.is_fully_approved === true) return true;

    const approvalsArr = (raw.aprobaciones || raw.approvals || raw.firmas || raw.signatures || []) as any[];
    const requiredArr = (raw.approval_scopes || raw.required_roles || raw.required_approvals || raw.required_signatures || []) as any[];

    const norm = (s: string) => s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // quitar acentos (producción -> produccion)

    const extractRole = (x: any): string | null => {
      if (!x) return null;
      const cand = x.role || x.rol || x.name || x.nombre || x.scope || x.tipo || x.tipo_aprobacion || x?.approverRole?.name || x?.approver_role?.name;
      return typeof cand === 'string' ? norm(cand) : null;
    };

    const approvedRoles = new Set((approvalsArr.map(extractRole).filter(Boolean) as string[]));
    let requiredRoles = (requiredArr.map(extractRole).filter(Boolean) as string[]);

    // Si no viene lista de requeridos, usamos el trío estándar
    if (requiredRoles.length === 0) requiredRoles = ['mantenimiento','produccion','calidad'];

    // Necesitamos todas las firmas requeridas presentes (sin confiar en conteos ni listas vacías de pendientes)
    return requiredRoles.length > 0 && requiredRoles.every(r => approvedRoles.has(r));
  };

  // Cálculo del porcentaje a mostrar: si no está totalmente aprobado, no mostrar 100%
  private static readonly displayPercent = (rawPercent: number, raw: any): number => {
    const p = Number(rawPercent) || 0;
    // Solo aplicamos gating al 100%; los niveles intermedios (25/50/75/90) sí se muestran
    if (p === 100 && !Matriz.isFullyApproved(raw)) return 0;
    return p;
  };

  private static readonly composeLabel = (objOrStr: any, codeKeys: string[], nameKeys: string[], fallbackPrefix?: string): string => {
    if (!objOrStr) return '';
    if (typeof objOrStr === 'string') return objOrStr;
    const code = codeKeys.map(k => objOrStr?.[k]).find(v => !!v);
    const name = nameKeys.map(k => objOrStr?.[k]).find(v => !!v);
    if (code && name) return `${code} - ${name}`;
    if (name && fallbackPrefix) return `${fallbackPrefix} - ${name}`;
    if (name) return String(name);
    if (code) return String(code);
    return '';
  };
  // Signals
  lineaSeleccionada = signal<string>('todas');
  
  // Registros con cache inteligente
  registros = computed(() => {
    const cache = this.registrosCache();
    const timestamp = this.cacheTimestamp();
    const now = Date.now();
    
    if (cache.length > 0 && (now - timestamp) < this.CACHE_DURATION) {
      return cache;
    }
    return cache; // Devolver cache aunque esté expirado, la recarga es asyncrona
  });
  
  // Datos computados optimizados para evitar recálculos innecesarios
  lineasDisponibles = computed(() => {
    const registros = this.registros();
    if (registros.length === 0) return [];
    
    const lineasSet = new Set<string>();
    registros.forEach(r => lineasSet.add(r.linea));
    return Array.from(lineasSet).sort();
  });

  operacionesPorLinea = computed(() => {
    const linea = this.lineaSeleccionada();
    const registros = this.registros();
    
    if (registros.length === 0) return [];
    
    const operacionesSet = new Set<string>();
    if (linea === 'todas') {
      registros.forEach(cert => operacionesSet.add(cert.operacion));
    } else {
      registros
        .filter(cert => cert.linea === linea)
        .forEach(cert => operacionesSet.add(cert.operacion));
    }
    
    return Array.from(operacionesSet).sort();
  });

  matrizData = computed(() => {
    const linea = this.lineaSeleccionada();
    const registros = this.registros();
    const operaciones = this.operacionesPorLinea();
    
    if (registros.length === 0) return [];
    
    // Filtrar y agrupar en una sola pasada para mejor rendimiento
    const empleadosMap = new Map<string, MatrizData>();
    
    const registrosFiltrados = linea === 'todas' ? registros : registros.filter(r => r.linea === linea);
    
    // Procesar registros en una sola iteración
    registrosFiltrados.forEach(cert => {
      const empleadoKey = cert.empleadoNumero;
      let empleado = empleadosMap.get(empleadoKey);
      
      if (!empleado) {
        empleado = {
          empleado: {
            numero: cert.empleadoNumero,
            nombre: cert.empleadoNombre,
            fechaIngreso: cert.empleadoFechaIngreso,
            fechaCertificacion: cert.empleadoFechaCertificacion
          },
          certificaciones: {},
          detalles: {}
        };
        empleadosMap.set(empleadoKey, empleado);
      }
      
      empleado.certificaciones[cert.operacion] = cert.porcentaje;
      // Guardar detalles de firmas y roles requeridos por operación
      const firmas = (cert as any).firmas || [];
      const requeridas = (cert as any).requeridas || [];
      empleado.detalles[cert.operacion] = { firmas, requeridas };
    });

    // Normalizar certificaciones para incluir todas las operaciones
    const resultados = Array.from(empleadosMap.values());
    resultados.forEach(emp => {
      const certificacionesNormalizadas: { [operacion: string]: number } = {};
      const detallesNormalizados: { [operacion: string]: { firmas: { role: string; by?: string; date?: string }[]; requeridas: string[] } } = {};
      operaciones.forEach(op => {
        certificacionesNormalizadas[op] = emp.certificaciones[op] || 0;
        detallesNormalizados[op] = emp.detalles?.[op] || { firmas: [], requeridas: [] };
      });
      emp.certificaciones = certificacionesNormalizadas;
      emp.detalles = detallesNormalizados;
    });

    return resultados;
  });

  // Estado computado para el UI
  datosVacios = computed(() => this.registros().length === 0);
  tieneFiltroLinea = computed(() => this.lineaSeleccionada() !== 'todas');

  // Métodos públicos para template (delegando a funciones puras)
  obtenerClasePorcentaje = Matriz.obtenerClasePorcentaje;
  formatearFecha = Matriz.formatearFecha;  
  formatearOperacion = Matriz.formatearOperacion;
  capitalizar = (s: string) => Matriz.capitalize(s);
  hasRole(firmas: { role: string }[] | undefined | null, rol: string): boolean {
    if (!firmas || !rol) return false;
    const r = rol.toLowerCase();
    return firmas.some(f => (f.role || '').toLowerCase() === r);
  }
  signerName(firmas: { role: string; by?: string }[] | undefined | null, rol: string): string {
    if (!firmas || !rol) return '';
    const r = rol.toLowerCase();
    const hit = firmas.find(f => (f.role || '').toLowerCase() === r);
    return (hit?.by || '').toString();
  }

  filtrarPorLinea(linea: string): void {
    this.lineaSeleccionada.set(linea);
  }

  // Método para forzar recarga de datos
  recargarDatos(): void {
    this.cacheTimestamp.set(0); // Invalidar cache
    this.cargarDatos();
  }

  exportarPDF(): void {
    // Función placeholder para exportar
    alert('Función de exportación a PDF - Por implementar');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos() {
    // Verificar cache antes de hacer la petición
    const now = Date.now();
    const timestamp = this.cacheTimestamp();
    if (this.registrosCache().length > 0 && (now - timestamp) < this.CACHE_DURATION) {
      return; // Cache válido, no recargar
    }

    // Usar la API real
    this.svc.getCertifiersWithUsers().subscribe({
      next: (rows: any[]) => {
        const mapeados = rows
          .filter(r => !!r)
          // Solo incluir certificaciones totalmente aprobadas (tres firmas completas)
          .filter(r => Matriz.isFullyApproved(r))
          .map(r => this.mapRow(r))
          .filter(r => !!r.empleadoNumero && !!r.operacion && !!r.linea);
        
        this.registrosCache.set(mapeados);
        this.cacheTimestamp.set(Date.now());
      },
      error: (_err) => {
        this.registrosCache.set([]);
        this.cacheTimestamp.set(Date.now());
      }
    });
  }

  private mapRow(r: any): { empleadoNumero: string; empleadoNombre: string; empleadoFechaIngreso: string; empleadoFechaCertificacion: string; linea: string; operacion: string; porcentaje: number; firmas?: { role: string; by?: string; date?: string }[]; requeridas?: string[] } {
    const empleadoNumero = r?.employee_number || r?.numeroEmpleado || r?.user?.employee_number || '';
    const empleadoNombre = r?.user?.name || r?.user?.nombre || r?.nombre || '';
    const empleadoFechaIngreso = r?.user?.fecha_ingreso || r?.user?.hire_date || r?.fecha_ingreso || '';
    const empleadoFechaCertificacion = r?.fecha_certificacion || r?.certification_date || '';

    // Línea: objeto o string
    const lineaObj = r?.line || r?.linea || r?.operation?.line || r?.operacion?.linea;
    const linea = Matriz.composeLabel(
      lineaObj,
      ['number_line', 'code', 'numero', 'clave', 'number'],
      ['name', 'nombre'],
      'L'
    );

    // Operación: objeto o string
    const opObj = r?.operation || r?.operacion;
    const operacion = Matriz.composeLabel(
      opObj,
      ['number_operation', 'code', 'numero', 'clave', 'number'],
      ['name', 'nombre'],
      'OP'
    );

    const porcentajeRaw = Number(
      r?.porcentaje ?? r?.percentage ?? r?.porcentajeCertificacion ?? r?.percent ?? 0
    ) || 0;
    const porcentaje = Matriz.displayPercent(porcentajeRaw, r);

    // Normalizar firmas/requeridas para UI (soporta estructura anidada del backend)
    const normalizeRole = (x: any): string | null => {
      if (!x) return null;
      const cand = x.role 
        || x.rol 
        || x.name 
        || x.nombre 
        || x.scope 
        || x.tipo 
        || x.tipo_aprobacion 
        || x?.approverRole?.name 
        || x?.approver_role?.name; // soporte snake_case del backend
      return typeof cand === 'string' ? cand.toLowerCase() : null;
    };
    const approverDisplay = (a: any): string => {
      const name = a?.approver?.name || a?.name || a?.approved_by || a?.aprobado_por || a?.user_name || '';
      const num = a?.approver?.employee_number || a?.employee_number || '';
      return num ? `${name} (${num})` : String(name || '');
    };
    const firmasArr: any[] = (r?.aprobaciones || r?.approvals || r?.firmas || r?.signatures || []) as any[];
    const requeridasArr: any[] = (r?.required_roles || r?.required_approvals || r?.required_signatures || r?.approval_scopes || []) as any[];
    const firmas = firmasArr.map(a => ({
      role: normalizeRole(a) || '',
      by: approverDisplay(a),
      date: a.approved_at || a.date || a.fecha || a.created_at
    })).filter(f => !!f.role);
  let requeridas = requeridasArr.map(normalizeRole).filter(Boolean) as string[];
  // Si el backend no envía los roles requeridos, usamos el trío estándar
  if (requeridas.length === 0) requeridas = ['mantenimiento','produccion','calidad'];

    return { empleadoNumero, empleadoNombre, empleadoFechaIngreso, empleadoFechaCertificacion, linea, operacion, porcentaje, firmas, requeridas };
  }
}
