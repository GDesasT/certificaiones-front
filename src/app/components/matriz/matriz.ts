import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPLEADOS_MOCK, CERTIFICACIONES_HISTORIAL_MOCK } from '../../models/certificacion.models';

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
  
  // Datos computados
  lineasDisponibles = computed(() => {
    const lineas = [...new Set(CERTIFICACIONES_HISTORIAL_MOCK.map(cert => cert.linea))];
    return lineas.sort();
  });

  operacionesPorLinea = computed(() => {
    const linea = this.lineaSeleccionada();
    if (linea === 'todas') {
      return [...new Set(CERTIFICACIONES_HISTORIAL_MOCK.map(cert => cert.operacion))].sort();
    }
    return [...new Set(
      CERTIFICACIONES_HISTORIAL_MOCK
        .filter(cert => cert.linea === linea)
        .map(cert => cert.operacion)
    )].sort();
  });

  matrizData = computed(() => {
    const empleados = EMPLEADOS_MOCK;
    const certificaciones = CERTIFICACIONES_HISTORIAL_MOCK;
    const linea = this.lineaSeleccionada();
    
    // Filtrar certificaciones por línea si es necesario
    const certsFiltradas = linea === 'todas' 
      ? certificaciones 
      : certificaciones.filter(cert => cert.linea === linea);

    return empleados.map(empleado => {
      const certEmpleado = certsFiltradas.filter(cert => cert.numeroEmpleado === empleado.numeroEmpleado);
      const certificacionesPorOperacion: { [operacion: string]: number } = {};
      
      // Inicializar todas las operaciones con 0
      this.operacionesPorLinea().forEach(operacion => {
        certificacionesPorOperacion[operacion] = 0;
      });
      
      // Llenar con los porcentajes reales
      certEmpleado.forEach(cert => {
        certificacionesPorOperacion[cert.operacion] = cert.porcentajeCertificacion;
      });

      return {
        empleado: {
          numero: empleado.numeroEmpleado,
          nombre: empleado.nombre
        },
        certificaciones: certificacionesPorOperacion
      };
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
}
