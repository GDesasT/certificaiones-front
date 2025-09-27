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
}

@Component({
  selector: 'app-matriz',
  imports: [CommonModule, FormsModule],
  templateUrl: './matriz.html',
  styleUrl: './matriz.css'
})
export class Matriz implements OnInit {
  private readonly svc = inject(CertificacionesService);
  
  // Cache para optimizar el rendimiento
  private registrosCache = signal<Array<{
    empleadoNumero: string;
    empleadoNombre: string;
    empleadoFechaIngreso: string;
    empleadoFechaCertificacion: string;
    linea: string;
    operacion: string;
    porcentaje: number;
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
          certificaciones: {}
        };
        empleadosMap.set(empleadoKey, empleado);
      }
      
      empleado.certificaciones[cert.operacion] = cert.porcentaje;
    });

    // Normalizar certificaciones para incluir todas las operaciones
    const resultados = Array.from(empleadosMap.values());
    resultados.forEach(emp => {
      const certificacionesNormalizadas: { [operacion: string]: number } = {};
      operaciones.forEach(op => {
        certificacionesNormalizadas[op] = emp.certificaciones[op] || 0;
      });
      emp.certificaciones = certificacionesNormalizadas;
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

  private mapRow(r: any): { empleadoNumero: string; empleadoNombre: string; empleadoFechaIngreso: string; empleadoFechaCertificacion: string; linea: string; operacion: string; porcentaje: number } {
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

    const porcentaje = Number(
      r?.porcentaje ?? r?.percentage ?? r?.porcentajeCertificacion ?? r?.percent ?? 0
    ) || 0;

    return { empleadoNumero, empleadoNombre, empleadoFechaIngreso, empleadoFechaCertificacion, linea, operacion, porcentaje };
  }
}
