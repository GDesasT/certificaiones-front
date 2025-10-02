import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';

type Tab = 'users'|'areas'|'lines'|'programs'|'operations'|'scopes';

@Component({
  selector: 'app-dev-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dev-panel.html',
  styleUrl: './dev-panel.css'
})
export class DevPanel implements OnInit {
  readonly tabs: Tab[] = ['users','areas','lines','programs','operations','scopes'];
  private readonly _tab = signal<Tab>('users');
  readonly tab = computed(() => this._tab());

  users: any[] = []; roles: any[] = []; newUserForm!: FormGroup;
  areas: any[] = []; newAreaForm!: FormGroup;
  lines: any[] = []; newLineForm!: FormGroup;
  programs: any[] = []; newProgramForm!: FormGroup;
  operations: any[] = []; newOperationForm!: FormGroup;
  scopes: any[] = []; newScopeForm!: FormGroup;

  loading = signal(false);

  constructor(private fb: FormBuilder, private api: AdminService) {}

  ngOnInit(): void {
    this.initForms();
    this.loadTab('users');
  }

  initForms() {
    this.newUserForm = this.fb.group({
      employee_number: ['', Validators.required],
      name: ['', Validators.required],
      classification: ['', Validators.required],
      position: ['', Validators.required],
      department: ['', Validators.required],
      area: ['', Validators.required],
      hire_date: ['', Validators.required],
      role_id: ['', Validators.required],
      password: ['', Validators.minLength(6)]
    });
    this.newAreaForm = this.fb.group({ name: ['', Validators.required], description: [''] });
    this.newLineForm = this.fb.group({ name: ['', Validators.required], description: [''], area_id: ['', Validators.required] });
    this.newProgramForm = this.fb.group({ name: ['', Validators.required], description: [''], line_id: ['', Validators.required] });
  // Backend espera 'programa_id' (no 'program_id') y requiere descripción
  this.newOperationForm = this.fb.group({ number_operation: ['', Validators.required], name: ['', Validators.required], description: ['', Validators.required], programa_id: ['', Validators.required] });
    this.newScopeForm = this.fb.group({ name: ['', Validators.required] });
  }

  setTab(t: Tab) {
    this._tab.set(t);
    this.loadTab(t);
  }

  loadTab(t: Tab) {
    this.loading.set(true);
    switch (t) {
      case 'users':
        this.api.getUsers().subscribe({ next: arr => { this.users = arr || []; }, complete: () => this.loading.set(false) });
        this.api.getRoles().subscribe({ next: arr => { this.roles = arr || []; } });
        break;
      case 'areas':
        this.api.getAreas().subscribe({ next: arr => { this.areas = arr || []; }, complete: () => this.loading.set(false) });
        break;
      case 'lines':
        this.api.getLines().subscribe({ next: arr => { this.lines = arr || []; }, complete: () => this.loading.set(false) });
        this.api.getAreas().subscribe({ next: arr => { this.areas = arr || []; } });
        break;
      case 'programs':
        this.api.getPrograms().subscribe({ next: arr => { this.programs = arr || []; }, complete: () => this.loading.set(false) });
        this.api.getLines().subscribe({ next: arr => { this.lines = arr || []; } });
        break;
      case 'operations':
        this.api.getOperations().subscribe({ next: arr => { this.operations = arr || []; }, complete: () => this.loading.set(false) });
        this.api.getPrograms().subscribe({ next: arr => { this.programs = arr || []; } });
        break;
      case 'scopes':
        this.api.getApprovalScopes().subscribe({ next: arr => { this.scopes = arr || []; }, complete: () => this.loading.set(false) });
        break;
    }
  }

  // Create handlers
  private toastOk(msg: string) {
    Swal.fire({ toast: true, icon: 'success', title: msg, position: 'top-start', showConfirmButton: false, timer: 1800, timerProgressBar: true });
  }
  private toastErr(msg: string) {
    Swal.fire({ toast: true, icon: 'error', title: msg, position: 'top-start', showConfirmButton: false, timer: 2500, timerProgressBar: true });
  }
  private firstErrorMessage(e: any, fallback = 'Ocurrió un error') {
    const msg = e?.error?.message || e?.message;
    const errors = e?.error?.errors; // Laravel 422 { errors: { field: [msg] } }
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      const firstVal = errors[firstKey];
      if (Array.isArray(firstVal) && firstVal.length) return firstVal[0];
      if (typeof firstVal === 'string') return firstVal;
    }
    return msg || fallback;
  }
  createUser() {
    if (this.newUserForm.invalid) return;
    this.api.createUser(this.newUserForm.value).subscribe({
      next: _ => { this.newUserForm.reset(); this.loadTab('users'); this.toastOk('Usuario creado'); },
      error: e => this.toastErr(this.firstErrorMessage(e, 'Error al crear usuario'))
    });
  }
  createArea() {
    if (this.newAreaForm.invalid) return;
    this.api.createArea(this.newAreaForm.value).subscribe({
      next: _ => { this.newAreaForm.reset(); this.loadTab('areas'); this.toastOk('Área creada'); },
      error: e => this.toastErr(e?.error?.message || 'Error al crear área')
    });
  }
  createLine() {
    if (this.newLineForm.invalid) return;
    this.api.createLine(this.newLineForm.value).subscribe({
      next: _ => { this.newLineForm.reset(); this.loadTab('lines'); this.toastOk('Línea creada'); },
      error: e => this.toastErr(e?.error?.message || 'Error al crear línea')
    });
  }
  createProgram() {
    if (this.newProgramForm.invalid) return;
    this.api.createProgram(this.newProgramForm.value).subscribe({
      next: _ => { this.newProgramForm.reset(); this.loadTab('programs'); this.toastOk('Programa creado'); },
      error: e => this.toastErr(e?.error?.message || 'Error al crear programa')
    });
  }
  createOperation() {
    if (this.newOperationForm.invalid) return;
    this.api.createOperation(this.newOperationForm.value).subscribe({
      next: _ => { this.newOperationForm.reset(); this.loadTab('operations'); this.toastOk('Operación creada'); },
      error: e => this.toastErr(this.firstErrorMessage(e, 'Error al crear operación'))
    });
  }
  createScope() {
    if (this.newScopeForm.invalid) return;
    this.api.createApprovalScope(this.newScopeForm.value).subscribe({
      next: _ => { this.newScopeForm.reset(); this.loadTab('scopes'); this.toastOk('Scope creado'); },
      error: e => this.toastErr(e?.error?.message || 'Error al crear scope')
    });
  }
}
