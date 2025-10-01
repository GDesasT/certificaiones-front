//=================[Importaciones]=========
import { Component, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

//=================[Interfaces]=========
interface Empleado {
  id?: number;
  numeroEmpleado: string;
  nombre: string;
  clasificacion: 'Directo' | 'Indirecto' | 'Temporal';
  puesto: string;
  departamento: string;
  area: string;
  fechaIngreso: Date;
  rol: 'Administrador' | 'Supervisor' | 'Operario';
  estado?: 'activo' | 'inactivo';
}

//=================[Componente Head Count]=========
@Component({
  selector: 'app-head-count',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './head-count.html',
  styleUrl: './head-count.css'
})
export class HeadCount {
  //=================[Inyecciones]=========
  private readonly fb = inject(FormBuilder);

  //=================[Referencias de Templates]=========
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  //=================[Signals de Estado]=========
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargandoDatos = signal(false);
  protected readonly guardandoEmpleado = signal(false);
  protected readonly importandoArchivo = signal(false);
  protected readonly modoEdicion = signal(false);
  protected readonly empleadoEditando = signal<Empleado | null>(null);
  protected readonly archivoSeleccionado = signal<File | null>(null);
  protected readonly dragging = signal(false);

  //=================[Propiedades Computadas]=========
  protected readonly totalEmpleados = computed(() => this.empleados().length);

  //=================[Formularios]=========
  protected readonly empleadoForm: FormGroup = this.fb.group({
    numeroEmpleado: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    clasificacion: ['', [Validators.required]],
    puesto: ['', [Validators.required]],
    departamento: ['', [Validators.required]],
    area: ['', [Validators.required]],
    fechaIngreso: ['', [Validators.required]],
    rol: ['', [Validators.required]]
  });

  //=================[Ciclo de Vida]=========
  ngOnInit(): void {
    this.cargarDatos();
  }

  //=================[Métodos de Datos]=========
  cargarDatos(): void {
    this.cargandoDatos.set(true);
    
    // Simular llamada a API
    setTimeout(() => {
      const empleadosMock: Empleado[] = [
        {
          id: 1,
          numeroEmpleado: '1001',
          nombre: 'Juan Carlos Pérez',
          clasificacion: 'Directo',
          puesto: 'Operario de Producción',
          departamento: 'Producción',
          area: 'Línea A',
          fechaIngreso: new Date('2023-01-15'),
          rol: 'Operario',
          estado: 'activo'
        },
        {
          id: 2,
          numeroEmpleado: '1002',
          nombre: 'María Elena González',
          clasificacion: 'Indirecto',
          puesto: 'Supervisora de Calidad',
          departamento: 'Calidad',
          area: 'Control de Calidad',
          fechaIngreso: new Date('2022-03-10'),
          rol: 'Supervisor',
          estado: 'activo'
        },
        {
          id: 3,
          numeroEmpleado: '1003',
          nombre: 'Roberto Silva Martínez',
          clasificacion: 'Directo',
          puesto: 'Técnico de Mantenimiento',
          departamento: 'Mantenimiento',
          area: 'Mecánica',
          fechaIngreso: new Date('2021-11-20'),
          rol: 'Operario',
          estado: 'activo'
        },
        {
          id: 4,
          numeroEmpleado: '1004',
          nombre: 'Ana Patricia López',
          clasificacion: 'Indirecto',
          puesto: 'Gerente de Recursos Humanos',
          departamento: 'Recursos Humanos',
          area: 'Administración',
          fechaIngreso: new Date('2020-06-01'),
          rol: 'Administrador',
          estado: 'activo'
        },
        {
          id: 5,
          numeroEmpleado: '1005',
          nombre: 'Carlos Eduardo Ruiz',
          clasificacion: 'Temporal',
          puesto: 'Auxiliar de Almacén',
          departamento: 'Logística',
          area: 'Almacén',
          fechaIngreso: new Date('2024-01-08'),
          rol: 'Operario',
          estado: 'activo'
        }
      ];
      
      this.empleados.set(empleadosMock);
      this.cargandoDatos.set(false);
    }, 1500);
  }

  //=================[Métodos de Modal]=========
  abrirModalAgregar(): void {
    this.modoEdicion.set(false);
    this.empleadoEditando.set(null);
    this.empleadoForm.reset();
    this.abrirModal();
  }

  editarEmpleado(empleado: Empleado): void {
    this.modoEdicion.set(true);
    this.empleadoEditando.set(empleado);
    
    // Llenar el formulario con los datos del empleado
    this.empleadoForm.patchValue({
      numeroEmpleado: empleado.numeroEmpleado,
      nombre: empleado.nombre,
      clasificacion: empleado.clasificacion,
      puesto: empleado.puesto,
      departamento: empleado.departamento,
      area: empleado.area,
      fechaIngreso: empleado.fechaIngreso.toISOString().split('T')[0],
      rol: empleado.rol
    });
    
    this.abrirModal();
  }

  private abrirModal(): void {
    const modalElement = document.getElementById('modalEmpleado');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModal(): void {
    const modalElement = document.getElementById('modalEmpleado');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.empleadoForm.reset();
    this.empleadoEditando.set(null);
  }

  //=================[Métodos CRUD]=========
  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.guardandoEmpleado.set(true);
    const formData = this.empleadoForm.value;

    // Simular llamada a API
    setTimeout(() => {
      const nuevoEmpleado: Empleado = {
        id: this.modoEdicion() ? this.empleadoEditando()?.id : Date.now(),
        numeroEmpleado: formData.numeroEmpleado,
        nombre: formData.nombre,
        clasificacion: formData.clasificacion,
        puesto: formData.puesto,
        departamento: formData.departamento,
        area: formData.area,
        fechaIngreso: new Date(formData.fechaIngreso),
        rol: formData.rol,
        estado: 'activo'
      };

      if (this.modoEdicion()) {
        // Actualizar empleado existente
        const empleados = this.empleados().map(emp => 
          emp.id === nuevoEmpleado.id ? nuevoEmpleado : emp
        );
        this.empleados.set(empleados);
        
        Swal.fire({
          icon: 'success',
          title: 'Empleado actualizado',
          text: 'Los datos del empleado han sido actualizados correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Agregar nuevo empleado
        this.empleados.set([...this.empleados(), nuevoEmpleado]);
        
        Swal.fire({
          icon: 'success',
          title: 'Empleado agregado',
          text: 'El nuevo empleado ha sido registrado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      this.guardandoEmpleado.set(false);
      this.cerrarModal();
    }, 1000);
  }

  eliminarEmpleado(empleado: Empleado): void {
    Swal.fire({
      title: '¿Eliminar empleado?',
      text: `¿Estás seguro de eliminar a ${empleado.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const empleados = this.empleados().filter(emp => emp.id !== empleado.id);
        this.empleados.set(empleados);
        
        Swal.fire({
          icon: 'success',
          title: 'Empleado eliminado',
          text: 'El empleado ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  //=================[Métodos de Importación]=========
  abrirModalImportar(): void {
    this.archivoSeleccionado.set(null);
    const modalElement = document.getElementById('modalImportar');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cerrarModalImportar(): void {
    const modalElement = document.getElementById('modalImportar');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.archivoSeleccionado.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.procesarArchivo(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.procesarArchivo(file);
    }
  }

  private procesarArchivo(file: File): void {
    // Validar tipo de archivo
    const tiposPermitidos = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                            'application/vnd.ms-excel'];
    
    if (!tiposPermitidos.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo Excel (.xlsx o .xls)'
      });
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo no debe superar los 10MB'
      });
      return;
    }

    this.archivoSeleccionado.set(file);
  }

  importarArchivo(): void {
    if (!this.archivoSeleccionado()) return;

    this.importandoArchivo.set(true);

    // Simular procesamiento del archivo Excel
    setTimeout(() => {
      // Datos simulados que se "extraerían" del Excel
      const empleadosImportados: Empleado[] = [
        {
          id: Date.now() + 1,
          numeroEmpleado: '2001',
          nombre: 'Pedro Ramírez Castillo',
          clasificacion: 'Directo',
          puesto: 'Operario de Corte',
          departamento: 'Producción',
          area: 'Línea B',
          fechaIngreso: new Date('2024-01-15'),
          rol: 'Operario',
          estado: 'activo'
        },
        {
          id: Date.now() + 2,
          numeroEmpleado: '2002',
          nombre: 'Lucia Fernández Torres',
          clasificacion: 'Indirecto',
          puesto: 'Analista de Calidad',
          departamento: 'Calidad',
          area: 'Laboratorio',
          fechaIngreso: new Date('2024-02-01'),
          rol: 'Operario',
          estado: 'activo'
        },
        {
          id: Date.now() + 3,
          numeroEmpleado: '2003',
          nombre: 'Miguel Ángel Vargas',
          clasificacion: 'Temporal',
          puesto: 'Ayudante General',
          departamento: 'Servicios Generales',
          area: 'Limpieza',
          fechaIngreso: new Date('2024-03-01'),
          rol: 'Operario',
          estado: 'activo'
        }
      ];

      // Agregar empleados importados a la lista existente
      const empleadosActuales = this.empleados();
      this.empleados.set([...empleadosActuales, ...empleadosImportados]);

      this.importandoArchivo.set(false);
      this.cerrarModalImportar();

      Swal.fire({
        icon: 'success',
        title: 'Importación exitosa',
        text: `Se han importado ${empleadosImportados.length} empleados correctamente`,
        timer: 3000,
        showConfirmButton: false
      });
    }, 2000);
  }
}
