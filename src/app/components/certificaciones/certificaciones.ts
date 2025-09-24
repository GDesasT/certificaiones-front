import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Certificacion {
  id: number;
  nombre: string;
  certificacion: string;
  fecha: string;
}

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificaciones.html',
  styleUrl: './certificaciones.css'
})
export class Certificaciones {
  
  /* ============ DATOS MOCKUP ============ */
  private readonly allCertificaciones: Certificacion[] = [
    { id: 1001, nombre: 'Juan Pérez', certificacion: 'Angular Avanzado', fecha: '2023-01-15' },
    { id: 1002, nombre: 'María Gómez', certificacion: 'React Básico', fecha: '2023-02-20' },
    { id: 1003, nombre: 'Carlos López', certificacion: 'Vue.js Intermedio', fecha: '2023-03-10' },
    { id: 1004, nombre: 'Ana Torres', certificacion: 'Node.js Básico', fecha: '2023-04-05' },
    { id: 1005, nombre: 'Pedro Martín', certificacion: 'Python Avanzado', fecha: '2023-05-12' }
  ];

  numeroEmpleado: number | string = '';

  /* ============ COMPUTED PROPERTIES ============ */
  get tableCertificaciones(): Certificacion[] {
    if (!this.numeroEmpleado) return this.allCertificaciones;
    
    const empleadoId = parseInt(this.numeroEmpleado.toString());
    return isNaN(empleadoId) ? [] : this.allCertificaciones.filter(cert => cert.id === empleadoId);
  }

  get nombreEmpleadoEncontrado(): string {
    if (!this.numeroEmpleado) return '';
    
    const empleadoId = parseInt(this.numeroEmpleado.toString());
    const empleado = this.allCertificaciones.find(cert => cert.id === empleadoId);
    return empleado?.nombre || '';
  }

  get hayBusquedaActiva(): boolean {
    return !!this.numeroEmpleado;
  }

  get noHayResultadosConBusqueda(): boolean {
    return this.tableCertificaciones.length === 0 && this.hayBusquedaActiva;
  }

  get noHayBusqueda(): boolean {
    return !this.hayBusquedaActiva;
  }

  /* ============ MÉTODOS PÚBLICOS ============ */
  limpiarBusqueda(): void {
    this.numeroEmpleado = '';
  }
}
