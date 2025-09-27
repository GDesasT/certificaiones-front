import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';

interface MatrizData {
  empleado: {
    numero: string;
    nombre: string;
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
  private registros = signal<Array<{
    empleadoNumero: string;
    empleadoNombre: string;
    linea: string; // "CODE - NAME"
    operacion: string; // "CODE - NAME"
    porcentaje: number; // 0|25|50|75|100
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

    // Empleados únicos visibles en esta vista
    const empleadosUnicos = Array.from(
      new Map(
        certsFiltradas.map(c => [c.empleadoNumero, { numero: c.empleadoNumero, nombre: c.empleadoNombre }])
      ).values()
    );

    return empleadosUnicos.map(empleado => {
      const certEmpleado = certsFiltradas.filter(cert => cert.empleadoNumero === empleado.numero);
      const certificacionesPorOperacion: { [operacion: string]: number } = {};

      // Inicializar todas las operaciones con 0
      this.operacionesPorLinea().forEach(operacion => {
        certificacionesPorOperacion[operacion] = 0;
      });

      // Llenar con los porcentajes reales
      certEmpleado.forEach(cert => {
        certificacionesPorOperacion[cert.operacion] = cert.porcentaje ?? 0;
      });

      return { empleado, certificaciones: certificacionesPorOperacion };
    });
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

  private mapRow(r: any): { empleadoNumero: string; empleadoNombre: string; linea: string; operacion: string; porcentaje: number } {
    const empleadoNumero = r?.employee_number || r?.numeroEmpleado || r?.employee_number || r?.user?.employee_number || '';
    const empleadoNombre = r?.user?.name || r?.user?.nombre || r?.nombre || '';

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

    return { empleadoNumero, empleadoNombre, linea, operacion, porcentaje };
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
