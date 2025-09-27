import { Component, computed, signal } from '@angular/core';
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
export class Matriz {
  // Signals
  lineaSeleccionada = signal<string>('todas');
  registros = signal<Array<{
    empleadoNumero: string;
    empleadoNombre: string;
    empleadoFechaIngreso: string;
    empleadoFechaCertificacion: string;
    linea: string;
    operacion: string;
    porcentaje: number;
  }>>([]);
  
  // Datos computados
  lineasDisponibles = computed(() => {
    const lineas = [...new Set(this.registros().map(r => r.linea))];
    return lineas.sort();
  });

  operacionesPorLinea = computed(() => {
    const linea = this.lineaSeleccionada();
    const fuente = this.registros();
    if (linea === 'todas') {
      return [...new Set(fuente.map(cert => cert.operacion))].sort();
    }
    return [...new Set(
      fuente
        .filter(cert => cert.linea === linea)
        .map(cert => cert.operacion)
    )].sort();
  });

  matrizData = computed(() => {
    const certificaciones = this.registros();
    const linea = this.lineaSeleccionada();
    
    // Filtrar certificaciones por línea si es necesario
    const certsFiltradas = linea === 'todas'
      ? certificaciones
      : certificaciones.filter(cert => cert.linea === linea);

    // Agrupar por empleado
    const empleadosMap = new Map();
    certsFiltradas.forEach(cert => {
      const key = cert.empleadoNumero;
      if (!empleadosMap.has(key)) {
        empleadosMap.set(key, {
          empleado: {
            numero: cert.empleadoNumero,
            nombre: cert.empleadoNombre,
            fechaIngreso: cert.empleadoFechaIngreso,
            fechaCertificacion: cert.empleadoFechaCertificacion
          },
          certificaciones: {}
        });
      }
      const empleado = empleadosMap.get(key);
      empleado.certificaciones[cert.operacion] = cert.porcentaje;
    });

    // Convertir el mapa en array y asegurar que todos tengan todas las operaciones
    const resultados = Array.from(empleadosMap.values());
    const operaciones = this.operacionesPorLinea();
    
    resultados.forEach(emp => {
      const certificacionesPorOperacion: any = {};
      operaciones.forEach(op => {
        certificacionesPorOperacion[op] = emp.certificaciones[op] || 0;
      });
      emp.certificaciones = certificacionesPorOperacion;
    });

    return resultados;
  });

  // Métodos
  filtrarPorLinea(linea: string): void {
    this.lineaSeleccionada.set(linea);
  }

  obtenerClasePorcentaje(porcentaje: number): string {
    if (porcentaje === 0) return 'cert-none';
    if (porcentaje === 25) return 'cert-25';
    if (porcentaje === 50) return 'cert-50';  
    if (porcentaje === 75) return 'cert-75';
    if (porcentaje === 90) return 'cert-90';
    if (porcentaje === 100) return 'cert-100';
    return 'cert-none';
  }

  formatearFecha(fecha: string): string {
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
  }

  exportarPDF(): void {
    // Función placeholder para exportar
    alert('Función de exportación a PDF - Por implementar');
  }

  formatearOperacion(operacion: string): { codigo: string; nombre: string } {
    const partes = operacion.split(' - ');
    return {
      codigo: partes[0],
      nombre: partes[1] || partes[0]
    };
  }

  constructor(private svc: CertificacionesService) {
    this.cargarDatos();
  }

  private cargarDatos() {
    // Usar la API real
    this.svc.getCertifiersWithUsers().subscribe({
      next: (rows: any[]) => {
        const mapeados = rows
          .filter(r => !!r)
          .map(r => this.mapRow(r))
          .filter(r => !!r.empleadoNumero && !!r.operacion && !!r.linea);
        this.registros.set(mapeados);
      },
      error: (_err) => {
        this.registros.set([]);
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
    const linea = this.composeLabel(
      lineaObj,
      ['number_line', 'code', 'numero', 'clave', 'number'],
      ['name', 'nombre'],
      'L'
    );

    // Operación: objeto o string
    const opObj = r?.operation || r?.operacion;
    const operacion = this.composeLabel(
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

  private composeLabel(objOrStr: any, codeKeys: string[], nameKeys: string[], fallbackPrefix?: string): string {
    if (!objOrStr) return '';
    if (typeof objOrStr === 'string') return objOrStr;
    const code = codeKeys.map(k => objOrStr?.[k]).find(v => !!v);
    const name = nameKeys.map(k => objOrStr?.[k]).find(v => !!v);
    if (code && name) return `${code} - ${name}`;
    if (name && fallbackPrefix) return `${fallbackPrefix} - ${name}`;
    if (name) return String(name);
    if (code) return String(code);
    return '';
  }
}
