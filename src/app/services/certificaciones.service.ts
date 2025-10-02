//=================[Servicio de Certificaciones]=========
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, timeout, catchError, shareReplay } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CertificacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;
  
  // Cache para catálogos
  private readonly cache = new Map<string, Observable<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  //=================[Métodos Genéricos]=========
  private getCachedData<T>(key: string, requestFn: () => Observable<T>): Observable<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const request$ = requestFn().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
      catchError(this.handleError)
    );

    this.cache.set(key, request$);
    
    // Clear cache after duration
    setTimeout(() => this.cache.delete(key), this.CACHE_DURATION);
    
    return request$;
  }

  private extractArrayFromResponse<T>(response: any, arrayKeys: string[] = ['usuarios','data', 'items', 'rows', 'result', 'results']): T[] {
    const candidates = arrayKeys.map(key => response?.[key]).concat([response]);
    const firstArray = candidates.find(x => Array.isArray(x));
    return (firstArray as T[]) ?? [];
  }

  private handleError = (error: any) => {
    // Solo logging en desarrollo
    if (!environment.production) {
      console.error('API Error:', error);
    }
    return throwError(() => error);
  };

  //=================[Catálogos Optimizados con Cache]=========
  getAreas() {
    return this.getCachedData('areas', () =>
      this.http.get<{ areas: any[] }>(`${this.base}/areas`)
        .pipe(map(r => this.extractArrayFromResponse(r, ['areas'])))
    );
  }

  getLinesByArea(areaId: number) {
    const key = `lines_${areaId}`;
    return this.getCachedData(key, () => {
      const params = new HttpParams().set('area_id', String(areaId));
      return this.http.get<{ lines: any[] }>(`${this.base}/lines`, { params })
        .pipe(map(r => this.extractArrayFromResponse(r, ['lines'])));
    });
  }

  getProgramsByLine(lineId: number) {
    const key = `programs_${lineId}`;
    return this.getCachedData(key, () => {
      const params = new HttpParams().set('line_id', String(lineId));
      return this.http.get<{ programs: any[] }>(`${this.base}/programs`, { params })
        .pipe(map(r => this.extractArrayFromResponse(r, ['programs'])));
    });
  }

  getOperationsByProgram(programId: number) {
    const key = `operations_${programId}`;
    return this.getCachedData(key, () => {
      const params = new HttpParams().set('program_id', String(programId));
      return this.http.get<{ operations: any[] }>(`${this.base}/operations`, { params })
        .pipe(map(r => this.extractArrayFromResponse(r, ['operations'])));
    });
  }

  //=================[Búsqueda de Usuarios Optimizada]=========
  findUserByNumber(employee_number: string) {
    return this.http.get<{ user: any }>(`${this.base}/users/by-number/${employee_number}`)
      .pipe(
        timeout(5000),
        map(r => r.user ?? null),
        catchError(error => {
          if (error.name === 'TimeoutError') {
            console.error('Búsqueda de empleado timeout');
            return throwError(() => new Error('Búsqueda del empleado toma demasiado tiempo. Verifica la conexión.'));
          }
          return this.handleError(error);
        })
      );
  }

  getAllUsers() {
    return this.getCachedData('users', () =>
      this.http.get<any>(`${this.base}/users`, { params: { all: 'true' } })
        .pipe(
          map(r => {
            const users = this.extractArrayFromResponse(r, ['usuarios','users']);
            return users.map((user: any) => ({
              employee_number: user.employee_number || user.number_employee || '',
              name: user.name || ''
            }));
          })
        )
    );
  }

  // Usuarios detallados (sin normalizar) para Head Count
  getUsersDetailed() {
    return this.getCachedData('users_detailed', () =>
      this.http.get<any>(`${this.base}/users`, { params: { all: 'true' } })
        .pipe(
          map(r => this.extractArrayFromResponse(r, ['usuarios','users'])),
          catchError(this.handleError)
        )
    );
  }

  //=================[Certificaciones CRUD]=========
  createCertification(payload: {
    employee_number: string;
    trainer_employee_number?: string;
    operation_id: number;
    porcentaje: number;
    fecha_certificacion: string;
    notas?: string | null;
  }) {
    return this.http.post(`${this.base}/certifiers`, payload)
      .pipe(catchError(this.handleError));
  }

  updateCertificationPercent(payload: {
    employee_number: string;
    operation_id: number;
    porcentaje: number;
    notas?: string | null;
  }) {
    return this.http.put(`${this.base}/certifiers/update-percent`, payload)
      .pipe(catchError(this.handleError));
  }

  //=================[Consulta de Certificaciones Unificada]=========
  getCertificationsByEmployee(employee_number: string) {
    const url = `${this.base}/certifiers-by-employee/${encodeURIComponent(employee_number)}`;
    
    return this.http
      .get<any>(url)
      .pipe(
        map(r => this.extractArrayFromResponse(r, ['certificaciones', 'certifiers', 'data', 'items', 'rows', 'result', 'results'])),
        catchError(this.handleError)
      );
  }

  getCertifiersWithUsers() {
    return this.http
      .get<any>(`${this.base}/certifiers-with-users`)
      .pipe(
        map(r => this.extractArrayFromResponse(r, ['certificaciones', 'certifiers', 'data', 'items', 'rows', 'result', 'results'])),
        catchError(this.handleError)
      );
  }

  //=================[Aprobaciones]=========
  listCertifiers(params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/certifiers`, { params })
      .pipe(catchError(this.handleError));
  }
  getCertifierById(id: number) {
    return this.http.get<any>(`${this.base}/certifiers/${id}`)
      .pipe(catchError(this.handleError));
  }
  listPendingByRole(role: 'mantenimiento'|'produccion'|'calidad', params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/certifiers/pending`, { params: { role, ...params } })
      .pipe(catchError(this.handleError));
  }
  approveCertifier(body: { certificacion_id: number; approver_number?: string; approver_qr?: string; approver_role: string; source?: string; notes?: string; }) {
    return this.http.post<any>(`${this.base}/certifiers/approve`, body)
      .pipe(catchError(this.handleError));
  }
  revokeApproval(body: { certificacion_id: number; approver_role: string; }) {
    return this.http.post<any>(`${this.base}/certifiers/revoke`, body)
      .pipe(catchError(this.handleError));
  }

  //=================[Resolver Aprobador (QR/Número)]=========
  resolveApprover(params: { code: string; approver_role?: string; certificacion_id?: number | string; }) {
    const httpParams = new HttpParams({ fromObject: {
      code: params.code,
      ...(params.approver_role ? { approver_role: params.approver_role } : {}),
      ...(params.certificacion_id ? { certificacion_id: String(params.certificacion_id) } : {})
    }});
    return this.http.get<any>(`${this.base}/certifiers/resolve-approver`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  //=================[Cache Management]=========
  clearCache(): void {
    this.cache.clear();
  }

  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }
}
