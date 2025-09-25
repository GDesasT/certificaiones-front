// src/app/services/certificaciones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CertificacionesService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  // Catálogos con filtros:
  getAreas() {
    return this.http.get<{ areas: any[] }>(`${this.base}/areas`)
      .pipe(map(r => (r as any).areas ?? (r as any)));
  }

  getLinesByArea(areaId: number) {
    const params = new HttpParams().set('area_id', String(areaId));
    return this.http.get<{ lines: any[] }>(`${this.base}/lines`, { params })
      .pipe(map(r => (r as any).lines ?? (r as any)));
  }

  getProgramsByLine(lineId: number) {
    const params = new HttpParams().set('line_id', String(lineId));
    return this.http.get<{ programs: any[] }>(`${this.base}/programs`, { params })
      .pipe(map(r => (r as any).programs ?? (r as any)));
  }

  getOperationsByProgram(programId: number) {
    const params = new HttpParams().set('program_id', String(programId));
    return this.http.get<{ operations: any[] }>(`${this.base}/operations`, { params })
      .pipe(map(r => (r as any).operations ?? (r as any)));
  }

  // Búsqueda de usuario (la recomendada):
  findUserByNumber(number_employee: string) {
    return this.http.get<{ user: any }>(`${this.base}/users/by-number/${number_employee}`)
      .pipe(map(r => r.user ?? null));
  }

  createCertification(payload: {
    number_employee: string;
    operation_id: number;
    porcentaje: number;
    fecha_certificacion: string;
    notas?: string | null;
  }) {
    return this.http.post(`${this.base}/certifiers`, payload);
  }

  // Historial de certificaciones por empleado
  getCertificationsByEmployee(number_employee: string) {
    return this.http
      .get<any>(`${this.base}/certifiers-by-employee/${encodeURIComponent(number_employee)}`)
      .pipe(
        map((r: any) => {
          const candidates = [r?.certificaciones, r?.certifiers, r?.data, r?.items, r?.rows, r?.result, r?.results, r];
          const firstArray = candidates.find((x) => Array.isArray(x));
          return (firstArray as any[]) ?? [];
        })
      );
  }
}
