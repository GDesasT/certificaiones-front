// src/app/components/certificar/certificar.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import Swal from 'sweetalert2';
import { COMPETENCIAS_25_MOCK, COMPETENCIAS_50_MOCK, COMPETENCIAS_75_MOCK, COMPETENCIAS_100_MOCK } from '../../models/certificacion.models';

interface Catalogo { id: number; nombre?: string; name?: string; }

@Component({
  selector: 'app-certificar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certificar.html',
  styleUrls: ['./certificar.css']
})
export class Certificar implements OnInit {
  private readonly empleadoActual = signal<{ numero: string; nombre: string | null } | null>(null);
  private readonly modalAbierto = signal<number | null>(null);
  private readonly cargandoGuardado = signal(false);
  private readonly buscandoEmpleado = signal(false);
  private readonly cargandoCache = signal(true);
  private readonly usuariosCache = signal<Array<{ employee_number: string; name: string }>>([]);
  readonly competenciasSeleccionadas = signal<{ [id: string]: boolean }>({});

  readonly datosEmpleado = computed(() => this.empleadoActual());
  readonly modalActivo = computed(() => this.modalAbierto());
  readonly guardando = computed(() => this.cargandoGuardado());
  readonly buscando = computed(() => this.buscandoEmpleado());
  readonly cacheReady = computed(() => !this.cargandoCache());

  certificacionForm!: FormGroup;

  // Catálogos en cascada
  areasApi: Catalogo[] = [];
  lineasApi: Catalogo[] = [];
  programasApi: Catalogo[] = [];
  operacionesApi: Catalogo[] = [];

  // Mocks de competencias (deja tus arrays)
  competenciasPorPorcentaje: { [k: number]: { id: string; descripcion: string }[] } = {
    25: [], 50: [], 75: [], 100: []
  };

  constructor(private fb: FormBuilder, private api: CertificacionesService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.certificacionForm.patchValue({ fechaEvaluacion: this.hoyISO() });
    this.cargarAreas();
    this.cargarUsuariosCache(); // Cargar todos los usuarios al inicio
    this.wireCascada();
    this.initCompetencias();
  }

  // -------- Form --------
  private initForm(): void {
    this.certificacionForm = this.fb.group({
      numeroEmpleado: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      nombre: [{ value: '', disabled: true }],
      trainerNumber: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],

      // NUEVO: área
      areaId: ['', Validators.required],

      // dependientes
      lineaId: [{ value: '', disabled: true }, Validators.required],
      programaId: [{ value: '', disabled: true }, Validators.required],
      operacionId: [{ value: '', disabled: true }, Validators.required],

      fechaEvaluacion: [{ value: '', disabled: true }, Validators.required],
      notas: ['']
    });

  // Nombre automático INSTANTÁNEO con cache local
    this.certificacionForm.get('numeroEmpleado')?.valueChanges.pipe(
      debounceTime(100), // Reducido a 100ms solo para evitar demasiadas actualizaciones
      distinctUntilChanged()
    ).subscribe((num: string) => {
      if (!num || num.length !== 4) { 
        this.resetEmpleado(); 
        return; 
      }
      
      // BÚSQUEDA INSTANTÁNEA en cache local
      const usuarioLocal = this.buscarUsuarioLocal(num);
      
      if (usuarioLocal) {
        // ✅ ENCONTRADO EN CACHE - INSTANTÁNEO
        const nombre = usuarioLocal.name;
        this.empleadoActual.set({ numero: num, nombre });
        this.certificacionForm.patchValue({ nombre });
        this.cargarHistorialEmpleado(num);
        return;
      }
      
      // Si no está en cache, intentar búsqueda en backend como fallback
      const cacheVacia = this.usuariosCache().length === 0;
      
      if (cacheVacia) {
        // Cache aún no se ha cargado, usar método original
        this.buscandoEmpleado.set(true);
        this.certificacionForm.patchValue({ nombre: 'Buscando...' });
        
        this.api.findUserByNumber(num).subscribe({
          next: user => {
            const nombre = user?.name ?? null;
            this.empleadoActual.set({ numero: num, nombre });
            this.certificacionForm.patchValue({ nombre: nombre ?? 'No encontrado' });
            this.buscandoEmpleado.set(false);

            if (nombre) {
              this.cargarHistorialEmpleado(num);
            }
          },
          error: err => {
            console.error('Error buscando empleado:', err);
            this.empleadoActual.set({ numero: num, nombre: null });
            this.buscandoEmpleado.set(false);
            
            let errorMsg = 'Error al buscar';
            if (err.message && err.message.includes('demasiado tiempo')) {
              errorMsg = 'Búsqueda lenta';
            } else if (err.status === 404) {
              errorMsg = 'No encontrado';
            } else if (err.status === 500) {
              errorMsg = 'Error servidor';
            }
            
            this.certificacionForm.patchValue({ nombre: errorMsg });
          }
        });
      } else {
        // Cache cargada pero usuario no encontrado
        this.empleadoActual.set({ numero: num, nombre: null });
        this.certificacionForm.patchValue({ nombre: 'No encontrado' });
      }
    });
  }

  // -------- Cascada: listeners --------
  private wireCascada(): void {
    // Área -> Líneas
    this.certificacionForm.get('areaId')?.valueChanges.subscribe((areaId: number) => {
      this.resetLineaProgramaOperacion();
      if (!areaId) return;
      this.certificacionForm.get('lineaId')?.disable();
      this.api.getLinesByArea(Number(areaId)).subscribe({
        next: lines => {
          const lista = (lines ?? []);
          this.lineasApi = this.filterByIdOptions(lista, Number(areaId), ['area_id','areaId','id_area','idArea']);
          this.certificacionForm.get('lineaId')?.enable();
        },
        error: _ => { this.lineasApi = []; }
      });
    });

    // Línea -> Programas
    this.certificacionForm.get('lineaId')?.valueChanges.subscribe((lineId: number) => {
      this.resetProgramaOperacion();
      if (!lineId) { this.certificacionForm.get('programaId')?.disable(); return; }
      this.certificacionForm.get('programaId')?.disable();
      this.api.getProgramsByLine(Number(lineId)).subscribe({
        next: programs => {
          const lista = (programs ?? []);
          this.programasApi = this.filterByIdOptions(lista, Number(lineId), ['line_id','lineId','linea_id','id_line','idLinea']);
          this.certificacionForm.get('programaId')?.enable();
        },
        error: _ => { this.programasApi = []; }
      });
    });

    // Programa -> Operaciones
    this.certificacionForm.get('programaId')?.valueChanges.subscribe((programId: number) => {
      this.resetOperacion();
      if (!programId) { this.certificacionForm.get('operacionId')?.disable(); return; }
      this.certificacionForm.get('operacionId')?.disable();
      this.api.getOperationsByProgram(Number(programId)).subscribe({
        next: ops => {
          const lista = (ops ?? []);
          this.operacionesApi = this.filterByIdOptions(lista, Number(programId), ['program_id','programId','programa_id','id_program','idPrograma']);
          this.certificacionForm.get('operacionId')?.enable();
        },
        error: _ => { this.operacionesApi = []; }
      });
    });
  }

  // -------- Carga inicial --------
  private cargarUsuariosCache(): void {
    console.log('Cargando usuarios para búsqueda instantánea...');
    this.cargandoCache.set(true);
    this.api.getAllUsers().subscribe({
      next: (users) => {
        this.usuariosCache.set(users);
        this.cargandoCache.set(false);
        console.log(`✅ Cache de usuarios cargada: ${users.length} usuarios - Búsqueda ahora es INSTANTÁNEA`);
      },
      error: (err) => {
        console.error('Error cargando cache de usuarios:', err);
        this.cargandoCache.set(false);
        // Si falla, seguir usando el método original
      }
    });
  }

  // -------- Búsqueda local instantánea --------
  private buscarUsuarioLocal(employee_number: string): { employee_number: string; name: string } | null {
    const usuarios = this.usuariosCache();
    return usuarios.find(user => user.employee_number === employee_number) || null;
  }

  // -------- Cargar catálogos raíz --------
  private cargarAreas(): void {
    this.api.getAreas().subscribe({
      next: areas => this.areasApi = areas ?? [],
      error: _ => this.areasApi = []
    });
  }

  // -------- Resets dependientes --------
  private resetEmpleado(): void {
    this.empleadoActual.set(null);
    this.buscandoEmpleado.set(false);
    this.certificacionForm.patchValue({ nombre: '' });
  }
  private resetLineaProgramaOperacion(): void {
    this.lineasApi = []; this.programasApi = []; this.operacionesApi = [];
    this.certificacionForm.patchValue({ lineaId: '', programaId: '', operacionId: '' });
    this.certificacionForm.get('lineaId')?.disable();
    this.certificacionForm.get('programaId')?.disable();
    this.certificacionForm.get('operacionId')?.disable();
  }
  private resetProgramaOperacion(): void {
    this.programasApi = []; this.operacionesApi = [];
    this.certificacionForm.patchValue({ programaId: '', operacionId: '' });
    this.certificacionForm.get('programaId')?.disable();
    this.certificacionForm.get('operacionId')?.disable();
  }
  private resetOperacion(): void {
    this.operacionesApi = [];
    this.certificacionForm.patchValue({ operacionId: '' });
    this.certificacionForm.get('operacionId')?.disable();
  }

  private initCompetencias(): void {
    // Mapear mocks a la forma { id, descripcion }
    const mapIt = (arr: Array<{ id: string; descripcion: string } | any>) =>
      (arr || []).map((c: any) => ({ id: String(c.id), descripcion: String(c.descripcion) }));

    this.competenciasPorPorcentaje = {
      25: mapIt(COMPETENCIAS_25_MOCK),
      50: mapIt(COMPETENCIAS_50_MOCK),
      75: mapIt(COMPETENCIAS_75_MOCK),
      100: mapIt(COMPETENCIAS_100_MOCK)
    };
  }

  // -------- Historial del empleado y percent actual --------
  private historial = signal<Array<{ operation_id: number; porcentaje: number }>>([]);

  private cargarHistorialEmpleado(num: string) {
    this.api.getCertificationsByEmployee(num).subscribe({
      next: (arr: any[]) => {
        const hist = (arr || []).map(r => ({
          operation_id: Number(r?.operation_id ?? r?.operacion_id ?? r?.operation?.id ?? 0),
          porcentaje: Number(r?.porcentaje ?? r?.percentage ?? r?.porcentajeCertificacion ?? 0)
        })).filter(x => x.operation_id > 0);
        this.historial.set(hist);
      },
      error: _ => this.historial.set([])
    });
  }

  private porcentajeActualOperacion(opId: number): number {
    const h = this.historial();
    const it = h.find(x => Number(x.operation_id) === Number(opId));
    return it ? Number(it.porcentaje) : 0;
  }

  // -------- Helpers UI --------
  hoyISO(): string { return new Date().toISOString().split('T')[0]; }
  nombreDe(lista: Catalogo[], id: number, fallback: string): string {
    const it = lista.find(x => x.id === Number(id));
    return it?.nombre ?? it?.name ?? (id ? `#${id}` : fallback);
  }
  nombreArea()     { return this.nombreDe(this.areasApi,      this.certificacionForm.value.areaId,     'Área'); }
  nombreLinea()    { return this.nombreDe(this.lineasApi,     this.certificacionForm.value.lineaId,    'Línea'); }
  nombrePrograma() { return this.nombreDe(this.programasApi,  this.certificacionForm.value.programaId, 'Programa'); }
  nombreOperacion(){ return this.nombreDe(this.operacionesApi,this.certificacionForm.value.operacionId,'Operación'); }

  // Nota: retiramos la deshabilitación por nivel; ahora solo mostramos alerta si es menor o igual.

  // -------- Modal / Competencias (igual que ya tenías) --------
  abrirModal(p: number) {
    if (!this.puedeIniciarCertificacion) {
      Swal.fire({ icon: 'info', title: 'Faltan datos', text: 'Completa No. empleado, área, línea, programa y operación.' });
      return;
    }
    const opId = Number(this.certificacionForm.value.operacionId);
    const actual = this.porcentajeActualOperacion(opId);
    if (p === actual) {
      Swal.fire({ icon: 'info', title: 'Ya está en este nivel', text: `El empleado ya tiene ${actual}%.` });
      return;
    }
    if (p < actual) {
      Swal.fire({ icon: 'warning', title: 'Nivel menor no permitido', text: `El empleado ya tiene ${actual}%. Solo puedes aumentar.` });
      return;
    }
    this.modalAbierto.set(p);
    const comps = this.competenciasPorPorcentaje[p] ?? [];
    const current = this.competenciasSeleccionadas();
    const next = { ...current };
    comps.forEach(c => { if (!(c.id in next)) next[c.id] = false; });
    this.competenciasSeleccionadas.set(next);
  }
  cerrarModal() { this.modalAbierto.set(null); }
  toggleCompetencia(id: string) {
    const a = this.competenciasSeleccionadas();
    this.competenciasSeleccionadas.set({ ...a, [id]: !a[id] });
  }
  verificarCompetenciasCompletas(p: number) {
    const comps = this.competenciasPorPorcentaje[p] ?? [];
    const sel = this.competenciasSeleccionadas();
    return comps.every(c => sel[c.id]);
  }
  getCompetenciasCompletadas(p: number) {
    const comps = this.competenciasPorPorcentaje[p] ?? [];
    const sel = this.competenciasSeleccionadas();
    return comps.filter(c => sel[c.id]).length;
  }
  getPorcentajeProgreso(p: number) {
    const t = (this.competenciasPorPorcentaje[p] ?? []).length;
    const c = this.getCompetenciasCompletadas(p);
    return t ? (c / t) * 100 : 0;
  }

  // -------- Acción principal --------
  certificarEmpleado(porcentaje: number) {
    if (!this.verificarCompetenciasCompletas(porcentaje)) {
      Swal.fire({ icon: 'warning', title: 'Completa las competencias', text: 'Debes completar todas las competencias seleccionadas.' });
      return;
    }
    const raw = this.certificacionForm.getRawValue();
    const opId = Number(raw.operacionId);
    const actual = this.porcentajeActualOperacion(opId);
    const notas = (raw.notas ?? '').trim() || null;

    // Validaciones adicionales antes de enviar
    if (!raw.numeroEmpleado || raw.numeroEmpleado.length !== 4) {
      Swal.fire({ icon: 'warning', title: 'Número de empleado inválido', text: 'El número de empleado debe tener 4 dígitos.' });
      return;
    }
    
    if (!raw.trainerNumber || raw.trainerNumber.length !== 4) {
      Swal.fire({ icon: 'warning', title: 'Número de entrenador inválido', text: 'El número de entrenador debe tener 4 dígitos.' });
      return;
    }
    
    if (!opId || opId <= 0) {
      Swal.fire({ icon: 'warning', title: 'Operación no válida', text: 'Debes seleccionar una operación válida.' });
      return;
    }
    
    if (!raw.fechaEvaluacion) {
      Swal.fire({ icon: 'warning', title: 'Fecha no válida', text: 'La fecha de evaluación es requerida.' });
      return;
    }

    console.log('Datos del formulario:', raw);
    console.log('Operación ID:', opId);
    console.log('Porcentaje:', porcentaje);

    // No permitir bajar
    if (porcentaje < actual) {
      Swal.fire({ icon: 'warning', title: 'No puedes bajar el nivel', text: `Nivel actual: ${actual}%.` });
      return;
    }

    this.cargandoGuardado.set(true);
    if (actual > 0) {
      // Actualiza porcentaje (PUT)
      this.api.updateCertificationPercent({
        employee_number: String(raw.numeroEmpleado),
        operation_id: opId,
        porcentaje,
        notas
      }).subscribe({
        next: _ => {
          Swal.fire({ icon: 'success', title: 'Actualizado', text: `Nuevo nivel: ${porcentaje}%` });
          this.cerrarModal();
          // refrescar historial para reflejar nuevo nivel
          this.cargarHistorialEmpleado(String(raw.numeroEmpleado));
        },
        error: e => Swal.fire({ icon: 'error', title: 'Error al actualizar', text: e?.error?.error || e?.error?.message || 'Ocurrió un error' }),
        complete: () => this.cargandoGuardado.set(false)
      });
    } else {
      // Crea certificación (POST)
      const payload = {
        employee_number: String(raw.numeroEmpleado),
        trainer_employee_number: String(raw.trainerNumber),
        operation_id: opId,
        porcentaje,
        fecha_certificacion: String(raw.fechaEvaluacion),
        notas
      };
      
      console.log('Payload a enviar:', payload);
      
      this.api.createCertification(payload).subscribe({
        next: _ => {
          Swal.fire({ icon: 'success', title: 'Certificación creada', text: `Nivel: ${porcentaje}%` });
          this.cerrarModal();
          this.cargarHistorialEmpleado(String(raw.numeroEmpleado));
        },
        error: e => {
          console.error('Error completo:', e);
          console.error('Error body:', e?.error);
          const errorMsg = e?.error?.message || e?.error?.error || e?.message || 'Ocurrió un error';
          Swal.fire({ 
            icon: 'error', 
            title: 'Error al guardar', 
            text: errorMsg,
            footer: `Código: ${e?.status || 'N/A'}`
          });
        },
        complete: () => this.cargandoGuardado.set(false)
      });
    }
  }

  // -------- Getters de estado --------
  get numeroEmpleadoValido(): boolean {
    const c = this.certificacionForm.get('numeroEmpleado');
    return !!(c && c.valid && c.value);
  }
  get trainerNumberValido(): boolean {
    const c = this.certificacionForm.get('trainerNumber');
    return !!(c && c.valid && c.value);
  }
  get formularioCompleto(): boolean {
    return this.numeroEmpleadoValido && this.trainerNumberValido &&
           !!this.certificacionForm.value.areaId &&
           !!this.certificacionForm.value.lineaId &&
           !!this.certificacionForm.value.programaId &&
           !!this.certificacionForm.value.operacionId;
  }
  get puedeIniciarCertificacion(): boolean {
    return this.formularioCompleto && !this.guardando();
  }
  onNumeroEmpleadoInput(e: any) {
    const v = String(e.target.value || '').replace(/[^0-9]/g, '').slice(0, 4);
    e.target.value = v;
    this.certificacionForm.patchValue({ numeroEmpleado: v });
  }
  onTrainerNumberInput(e: any) {
    const v = String(e.target.value || '').replace(/[^0-9]/g, '').slice(0, 4);
    e.target.value = v;
    this.certificacionForm.patchValue({ trainerNumber: v });
  }

  // -------- Utilidades de filtrado defensivo --------
  private filterByIdOptions<T extends Record<string, any>>(list: T[], id: number, keys: string[]): T[] {
    const idNum = Number(id);
    // Si la API ya viene filtrada (lista corta y sin claves), devolver tal cual
    if (!Array.isArray(list) || list.length === 0) return list;
    const hasAnyKey = keys.some(k => list.some(item => item && (k in item)));
    if (!hasAnyKey) return list;
    return list.filter(item => keys.some(k => Number(item?.[k]) === idNum));
  }
}
