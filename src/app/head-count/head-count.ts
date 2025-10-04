//=================[Importaciones]=========
import { Component, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CertificacionesService } from '../services/certificaciones.service';

//=================[Interfaces]=========
interface Empleado {
  id?: number;
  numeroEmpleado: string;
  nombre: string;
  clasificacion: 'A' | 'D' | 'I' | 'E' | 'X';
  puesto: string;
  departamento: string;
  area: string;
  fechaIngreso: Date;
  rol: 'mantenimiento' | 'produccion' | 'calidad' | 'trainer' | 'employee' | 'dev' | 'disabled';
  estado?: 'activo' | 'inactivo';
}

//=================[Componente Head Count]=========
@Component({
  selector: 'app-head-count',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './head-count.html',
  styleUrl: './head-count.css'
})
export class HeadCount {
  //=================[Inyecciones]=========
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CertificacionesService);

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

  //=================[Filtros]=========
  protected filtroNumeroEmpleado = '';
  protected filtroNombre = '';
  private _empleadosFiltrados = signal<Empleado[]>([]);

  //=================[Propiedades Computadas]=========
  protected readonly totalEmpleados = computed(() => this.empleados().length);
  
  protected readonly empleadosFiltrados = computed(() => {
    return this._empleadosFiltrados();
  });

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
    
    // Inicializar filtros
    this._empleadosFiltrados.set(this.empleados());
  }

  //=================[Métodos de Datos]=========
  cargarDatos(): void {
    this.cargandoDatos.set(true);
    this.api.getUsersDetailed().subscribe({
      next: (users: any[]) => {
        const mapped: Empleado[] = (Array.isArray(users) ? users : []).map((u, idx) => ({
          id: Number(u.id ?? idx + 1),
          numeroEmpleado: String(u.employee_number ?? u.number_employee ?? u.numeroEmpleado ?? u.numero ?? ''),
          nombre: String(u.name ?? u.nombre ?? ''),
          clasificacion: (String(u.classification ?? u.clasificacion ?? 'D') as any),
          puesto: String(u.position ?? u.puesto ?? u.job_title ?? 'Operario'),
          departamento: String(u.department ?? u.departamento ?? ''),
          area: String(u.area?.name ?? u.area?.nombre ?? u.area ?? ''),
          fechaIngreso: new Date(u.hire_date ?? u.fecha_ingreso ?? Date.now()),
          rol: (String(u.role?.name ?? u.rol ?? 'employee') as any),
          estado: (String(u.status ?? u.estado ?? 'activo') as any)
        }));
        this.empleados.set(mapped);
        this.aplicarFiltros(); // Aplicar filtros después de cargar datos
        this.cargandoDatos.set(false);
      },
      error: _ => {
        this.empleados.set([]);
        this._empleadosFiltrados.set([]);
        this.cargandoDatos.set(false);
      }
    });
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

    // Preparar datos para la API (usando los mismos campos que se reciben)
    const empleadoData: any = {
      employee_number: formData.numeroEmpleado,
      name: formData.nombre,
      classification: formData.clasificacion,
      position: formData.puesto,
      department: formData.departamento,
      area: formData.area,
      hire_date: formData.fechaIngreso,
      rol: formData.rol  // Enviar "rol" sin 'e', igual que se recibe
    };

    // Si estamos editando, incluir el ID
    if (this.modoEdicion()) {
      const empleadoEditando = this.empleadoEditando();
      if (empleadoEditando?.id) {
        empleadoData.id = empleadoEditando.id;
      }
    }

    // Debug: Verificar qué se está enviando
    console.log('Datos que se enviarán al backend:', empleadoData);
    console.log('Modo edición:', this.modoEdicion());
    console.log('Empleado editando:', this.empleadoEditando());

    this.api.createOrUpdateEmployee(empleadoData).subscribe({
      next: (response) => {
        this.guardandoEmpleado.set(false);
        this.cerrarModal();
        
        // Actualización optimista inmediata
        if (this.modoEdicion()) {
          // Actualizar el empleado en la lista local inmediatamente
          const empleados = this.empleados();
          const empleadoEditando = this.empleadoEditando();
          if (empleadoEditando) {
            const index = empleados.findIndex(e => e.id === empleadoEditando.id);
            if (index !== -1) {
              // Actualizar con los nuevos datos
              empleados[index] = {
                ...empleados[index],
                numeroEmpleado: formData.numeroEmpleado,
                nombre: formData.nombre,
                clasificacion: formData.clasificacion,
                puesto: formData.puesto,
                departamento: formData.departamento,
                area: formData.area,
                fechaIngreso: new Date(formData.fechaIngreso),
                rol: formData.rol  // Actualizar el rol inmediatamente
              };
              
              // Actualizar la lista y aplicar filtros
              this.empleados.set([...empleados]);
              this.aplicarFiltros();
            }
          }
        }
        
        // Recargar la lista del backend (para estar seguro)
        this.cargarDatos();
        
        const mensaje = this.modoEdicion() ? 'Empleado actualizado' : 'Empleado agregado';
        const texto = this.modoEdicion() 
          ? 'Los datos del empleado han sido actualizados correctamente'
          : 'El nuevo empleado ha sido registrado correctamente';
        
        Swal.fire({
          icon: 'success',
          title: mensaje,
          text: texto,
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.guardandoEmpleado.set(false);
        console.error('Error guardando empleado:', error);
        
        let mensaje = 'Error al guardar el empleado';
        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.error?.errors) {
          mensaje = `Errores: ${Object.values(error.error.errors).join(', ')}`;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje
        });
      }
    });
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

  //=================[Métodos de Importación]=========
  
  descargarTemplate(): void {
    this.api.downloadExcelTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'template_empleados.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando template:', error);
        
        // Mostrar información sobre el formato esperado
        Swal.fire({
          icon: 'info',
          title: 'Template no disponible',
          html: `
            <p>El template del servidor no está disponible, pero puedes crear tu archivo Excel con estas columnas:</p>
            <div class="text-start mt-3">
              <strong>Columnas requeridas:</strong><br>
              • employee_number<br>
              • name<br>
              • classification<br>
              • position<br>
              • department<br>
              • area<br>
              • hire_date (formato: YYYY-MM-DD)
            </div>
          `,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  importarArchivo(): void {
    if (!this.archivoSeleccionado()) return;

    this.importandoArchivo.set(true);

    // Primero intentar con la API real
    this.api.importFromExcel(this.archivoSeleccionado()!).subscribe({
      next: (response) => {
        this.importandoArchivo.set(false);
        this.cerrarModalImportar();
        
        // Recargar la lista de empleados
        this.cargarDatos();
        
        const mensaje = response.message || 'Empleados importados correctamente';
        const cantidad = response.imported_count || response.count || 'varios';
        
        Swal.fire({
          icon: 'success',
          title: 'Importación exitosa',
          text: `${mensaje}. Se importaron ${cantidad} empleados.`,
          timer: 4000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error importando archivo:', error);
        
        // Si es error 404 o 422, mostrar mensaje informativo
        if (error.status === 404 || error.status === 422) {
          this.importandoArchivo.set(false);
          Swal.fire({
            icon: 'info',
            title: 'Funcionalidad pendiente',
            text: 'La importación de archivos estará disponible cuando se configure el backend.',
            confirmButtonText: 'Entendido'
          });
          return;
        }
        
        this.importandoArchivo.set(false);
        
        let mensaje = 'Error al importar el archivo Excel';
        let detalles = '';
        
        if (error.status === 0) {
          mensaje = 'Error de conexión';
          detalles = 'No se pudo conectar con el servidor.';
        } else if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.error?.errors) {
          detalles = `Errores: ${Object.values(error.error.errors).join(', ')}`;
        }
        
        Swal.fire({
          icon: 'error',
          title: mensaje,
          text: detalles || 'Por favor, verifica tu archivo y vuelve a intentarlo.',
          confirmButtonText: 'Entendido',
          footer: `<small>Código de error: ${error.status}</small>`
        });
      }
    });
  }

  //=================[Métodos de Filtrado]=========
  
  aplicarFiltros(): void {
    const empleados = this.empleados();
    let resultado = [...empleados]; // Crear copia
    
    // Filtrar por número de empleado
    if (this.filtroNumeroEmpleado.trim()) {
      resultado = resultado.filter(emp => 
        emp.numeroEmpleado.toLowerCase().includes(this.filtroNumeroEmpleado.trim().toLowerCase())
      );
    }
    
    // Filtrar por nombre
    if (this.filtroNombre.trim()) {
      resultado = resultado.filter(emp => 
        emp.nombre.toLowerCase().includes(this.filtroNombre.trim().toLowerCase())
      );
    }
    
    this._empleadosFiltrados.set(resultado);
  }

  limpiarFiltros(): void {
    this.filtroNumeroEmpleado = '';
    this.filtroNombre = '';
    this.aplicarFiltros();
  }

  tienesFiltrosActivos(): boolean {
    return this.filtroNumeroEmpleado.trim() !== '' || this.filtroNombre.trim() !== '';
  }
}
