//=================[Servicio de Certificaciones]=========
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, timeout, catchError, shareReplay } from 'rxjs/operators';
import { throwError, Observable, of, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Http as CapacitorHttp } from '@capacitor-community/http';

@Injectable({ providedIn: 'root' })
export class CertificacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;
  private readonly isNative = Capacitor.isNativePlatform();
  
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

  private parseData<T>(data: any): T {
    if (typeof data === 'string') {
      try { return JSON.parse(data) as T; } catch { return data as T; }
    }
    return data as T;
  }

  private authHeaders(): Record<string, string> {
    try {
      const token = localStorage.getItem('auth_token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }

  private nativeGet<T>(url: string, params?: any): Observable<T> {
    if (!environment.production) console.debug('[HTTP][native][GET]', url, params || '');
    return from(CapacitorHttp.get({ url, params, headers: { 'Accept': 'application/json', ...this.authHeaders() } }))
      .pipe(map(res => this.parseData<T>(res.data)));
  }

  private nativePost<T>(url: string, data?: any): Observable<T> {
    if (!environment.production) console.debug('[HTTP][native][POST]', url, data || '');
    return from(CapacitorHttp.post({ url, data, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...this.authHeaders() } }))
      .pipe(map(res => this.parseData<T>(res.data)));
  }

  private nativePut<T>(url: string, data?: any): Observable<T> {
    if (!environment.production) console.debug('[HTTP][native][PUT]', url, data || '');
    return from(CapacitorHttp.put({ url, data, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...this.authHeaders() } }))
      .pipe(map(res => this.parseData<T>(res.data)));
  }

  private getReq<T>(path: string, params?: any): Observable<T> {
    const url = `${this.base}${path}`;
    if (this.isNative) return this.nativeGet<T>(url, params);
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;
    if (!environment.production) console.debug('[HTTP][web][GET]', url, params || '');
    return this.http.get<T>(url, { params: httpParams });
  }

  private postReq<T>(path: string, body?: any): Observable<T> {
    const url = `${this.base}${path}`;
    if (this.isNative) return this.nativePost<T>(url, body);
    if (!environment.production) console.debug('[HTTP][web][POST]', url, body || '');
    return this.http.post<T>(url, body);
  }

  private putReq<T>(path: string, body?: any): Observable<T> {
    const url = `${this.base}${path}`;
    if (this.isNative) return this.nativePut<T>(url, body);
    if (!environment.production) console.debug('[HTTP][web][PUT]', url, body || '');
    return this.http.put<T>(url, body);
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
      this.getReq<{ areas: any[] }>(`/areas`)
        .pipe(map(r => this.extractArrayFromResponse(r, ['areas'])))
    );
  }

  getLinesByArea(areaId: number) {
    const key = `lines_${areaId}`;
    return this.getCachedData(key, () => {
      const params = { area_id: String(areaId) };
      return this.getReq<{ lines: any[] }>(`/lines`, params)
        .pipe(map(r => this.extractArrayFromResponse(r, ['lines'])));
    });
  }

  getProgramsByLine(lineId: number) {
    const key = `programs_${lineId}`;
    return this.getCachedData(key, () => {
      const params = { line_id: String(lineId) };
      return this.getReq<{ programs: any[] }>(`/programs`, params)
        .pipe(map(r => this.extractArrayFromResponse(r, ['programs'])));
    });
  }

  getOperationsByProgram(programId: number) {
    const key = `operations_${programId}`;
    return this.getCachedData(key, () => {
      const params = { program_id: String(programId) };
      return this.getReq<{ operations: any[] }>(`/operations`, params)
        .pipe(map(r => this.extractArrayFromResponse(r, ['operations'])));
    });
  }

  //=================[Búsqueda de Usuarios Optimizada]=========
  findUserByNumber(employee_number: string) {
    return this.getReq<{ user: any }>(`/users/by-number/${employee_number}`)
      .pipe(
        timeout(5000),
        map((r: any) => r?.user ?? r ?? null),
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
      this.getReq<any>(`/users`, { all: 'true' })
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
      this.getReq<any>(`/users`, { all: 'true' })
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
    return this.postReq<any>(`/certifiers`, payload)
      .pipe(catchError(this.handleError));
  }

  updateCertificationPercent(payload: {
    employee_number: string;
    operation_id: number;
    porcentaje: number;
    notas?: string | null;
  }) {
    return this.putReq<any>(`/certifiers/update-percent`, payload)
      .pipe(catchError(this.handleError));
  }

  //=================[Consulta de Certificaciones Unificada]=========
  getCertificationsByEmployee(employee_number: string) {
    const path = `/certifiers-by-employee/${encodeURIComponent(employee_number)}`;
    return this.getReq<any>(path)
      .pipe(
        map(r => this.extractArrayFromResponse(r, ['certificaciones', 'certifiers', 'data', 'items', 'rows', 'result', 'results'])),
        catchError(this.handleError)
      );
  }

  getCertifiersWithUsers() {
    return this.getReq<any>(`/certifiers-with-users`)
      .pipe(
        map(r => this.extractArrayFromResponse(r, ['certificaciones', 'certifiers', 'data', 'items', 'rows', 'result', 'results'])),
        catchError(this.handleError)
      );
  }

  //=================[Aprobaciones]=========
  listCertifiers(params: Record<string, any> = {}) {
    return this.getReq<any>(`/certifiers`, params)
      .pipe(catchError(this.handleError));
  }
  getCertifierById(id: number) {
    return this.getReq<any>(`/certifiers/${id}`)
      .pipe(catchError(this.handleError));
  }
  listPendingByRole(role: 'mantenimiento'|'produccion'|'calidad', params: Record<string, any> = {}) {
    return this.getReq<any>(`/certifiers/pending`, { role, ...params })
      .pipe(catchError(this.handleError));
  }
  approveCertifier(body: { certificacion_id: number; approver_number?: string; approver_qr?: string; approver_role: string; source?: string; notes?: string; }) {
    return this.postReq<any>(`/certifiers/approve`, body)
      .pipe(catchError(this.handleError));
  }
  revokeApproval(body: { certificacion_id: number; approver_role: string; }) {
    return this.postReq<any>(`/certifiers/revoke`, body)
      .pipe(catchError(this.handleError));
  }

  //=================[Resolver Aprobador (QR/Número)]=========
  resolveApprover(params: { code: string; approver_role?: string; certificacion_id?: number | string; }) {
    const q = {
      code: params.code,
      ...(params.approver_role ? { approver_role: params.approver_role } : {}),
      ...(params.certificacion_id ? { certificacion_id: String(params.certificacion_id) } : {})
    } as Record<string, any>;
    return this.getReq<any>(`/certifiers/resolve-approver`, q)
      .pipe(catchError(this.handleError));
  }

  //=================[Importación de Empleados]=========
  
  // Importar empleados desde Excel
  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<any>(`${this.base}/users/import`, formData)
      .pipe(
        timeout(60000), // 60 segundos para archivos grandes
        catchError(this.handleError)
      );
  }

  // Descargar template de Excel
  downloadExcelTemplate(): Observable<Blob> {
    return this.http.get(`${this.base}/users/import/template`, { 
      responseType: 'blob',
      observe: 'body'
    }).pipe(catchError(this.handleError));
  }

  // Crear/actualizar empleado individual
  createOrUpdateEmployee(employeeData: any): Observable<any> {
    // Si tiene ID, es una actualización (PUT)
    if (employeeData.id) {
      const id = employeeData.id;
      const { id: _, ...dataWithoutId } = employeeData; // Remover ID del body
      return this.http.put<any>(`${this.base}/users/${id}`, dataWithoutId)
        .pipe(catchError(this.handleError));
    } 
    // Si no tiene ID, es creación (POST)
    else {
      return this.http.post<any>(`${this.base}/users`, employeeData)
        .pipe(catchError(this.handleError));
    }
  }

  //=================[Cache Management]=========
  clearCache(): void {
    this.cache.clear();
  }

  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }

  constructor() {
    if (!environment.production) {
      console.debug('[API] base =', this.base, '| native =', this.isNative);
    }
  }
}
