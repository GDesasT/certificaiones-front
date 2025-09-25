// src/app/components/certificar/certificar.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';

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
  readonly competenciasSeleccionadas = signal<{ [id: string]: boolean }>({});

  readonly datosEmpleado = computed(() => this.empleadoActual());
  readonly modalActivo = computed(() => this.modalAbierto());
  readonly guardando = computed(() => this.cargandoGuardado());

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
    this.wireCascada();
  }

  // -------- Form --------
  private initForm(): void {
    this.certificacionForm = this.fb.group({
      numeroEmpleado: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      nombre: [{ value: '', disabled: true }],

      // NUEVO: área
      areaId: ['', Validators.required],

      // dependientes
      lineaId: [{ value: '', disabled: true }, Validators.required],
      programaId: [{ value: '', disabled: true }, Validators.required],
      operacionId: [{ value: '', disabled: true }, Validators.required],

      fechaEvaluacion: [{ value: '', disabled: true }, Validators.required],
      notas: ['']
    });

    // Nombre automático
    this.certificacionForm.get('numeroEmpleado')?.valueChanges.subscribe((num: string) => {
      if (!num || num.length !== 4) { this.resetEmpleado(); return; }
      this.api.findUserByNumber(num).subscribe({
        next: user => {
          const nombre = user?.name ?? null;
          this.empleadoActual.set({ numero: num, nombre });
          this.certificacionForm.patchValue({ nombre: nombre ?? '' });
        },
        error: _ => { this.empleadoActual.set({ numero: num, nombre: null }); this.certificacionForm.patchValue({ nombre: '' }); }
      });
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

  // -------- Modal / Competencias (igual que ya tenías) --------
  abrirModal(p: number) {
    if (!this.puedeIniciarCertificacion) {
      alert('Complete No. empleado, área, línea, programa y operación.');
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
      alert('Debe completar todas las competencias.');
      return;
    }
    const raw = this.certificacionForm.getRawValue();
    const payload = {
      number_employee: String(raw.numeroEmpleado),
      operation_id: Number(raw.operacionId), // ← operación ya filtrada por programa
      porcentaje,
      fecha_certificacion: String(raw.fechaEvaluacion),
      notas: (raw.notas ?? '').trim() || null
    };
    this.cargandoGuardado.set(true);
    this.api.createCertification(payload).subscribe({
      next: _ => { alert(`Empleado certificado al ${porcentaje}%`); this.cerrarModal(); },
      error: e => alert(e?.error?.error || e?.error?.message || 'Error al guardar'),
      complete: () => this.cargandoGuardado.set(false)
    });
  }

  // -------- Getters de estado --------
  get numeroEmpleadoValido(): boolean {
    const c = this.certificacionForm.get('numeroEmpleado');
    return !!(c && c.valid && c.value);
  }
  get formularioCompleto(): boolean {
    return this.numeroEmpleadoValido &&
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
