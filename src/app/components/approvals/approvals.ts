import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';
import { QrScannerComponent } from '../../shared/components/qr-scanner/qr-scanner.component';

type Role = 'mantenimiento' | 'produccion' | 'calidad';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QrScannerComponent],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css'
})
export class Approvals implements OnInit {
  readonly roles: Role[] = ['mantenimiento','produccion','calidad'];
  filtroForm!: FormGroup;
  private readonly _role = signal<Role>('mantenimiento');
  private readonly _pending = signal<any[]>([]);
  private readonly _loading = signal(false);

  readonly role = computed(() => this._role());
  readonly pending = computed(() => this._pending());
  readonly loading = computed(() => this._loading());
  showScanner = signal(false);

  constructor(private fb: FormBuilder, private api: CertificacionesService) {}

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      role: ['mantenimiento', Validators.required],
      approver_number: ['', []]
    });
    this.cargar();
    this.filtroForm.get('role')?.valueChanges.subscribe((r: Role) => {
      this._role.set(r);
      this.cargar();
    });
  }

  cargar() {
    this._loading.set(true);
    this.api.listPendingByRole(this._role(), { per_page: 50 }).subscribe({
      next: (resp: any) => {
        const arr = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        this._pending.set(arr);
      },
      error: _ => this._pending.set([]),
      complete: () => this._loading.set(false)
    });
  }

  aprobar(item: any) {
    const certId = Number(item?.id || item?.certifier_id || item?.certificacion_id);
    const number = String(this.filtroForm.value.approver_number || '').trim();
    if (!certId || !number) return;
    this.api.approveCertifier({ certificacion_id: certId, approver_number: number, approver_role: this._role() })
      .subscribe({ next: _ => this.cargar() });
  }

  onScan(value: string) {
    // En nuestro flujo, el QR contiene exactamente el employee_number
    this.filtroForm.patchValue({ approver_number: value });
    this.showScanner.set(false);
  }
}
