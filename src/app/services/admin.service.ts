//=================[Servicio Admin / Dev Panel]=========
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  private extractArray<T>(r: any, keys: string[] = ['data','items','rows','result','results']): T[] {
    // Fast paths on root
    if (Array.isArray(r)) return r as T[];
    for (const k of keys) {
      const v = r?.[k];
      if (Array.isArray(v)) return v as T[];
      if (Array.isArray(v?.data)) return v.data as T[];
    }
    // Check common nested envelopes
    const containers = [r?.data, r?.result, r?.payload, r?.users, r?.items, r?.rows, r?.results];
    for (const c of containers) {
      if (!c) continue;
      if (Array.isArray(c)) return c as T[];
      for (const k of keys.concat(['users'])) {
        const v = c?.[k];
        if (Array.isArray(v)) return v as T[];
        if (Array.isArray(v?.data)) return v.data as T[];
      }
      if (Array.isArray(c?.data)) return c.data as T[];
    }
    return [] as T[];
  }
  private handle = (e: any) => throwError(() => e);

  //=================[Users]=========
  getUsers(params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/users`, { params })
      .pipe(
        // Backend devuelve { usuarios: { data: [...] } }
        map(r => this.extractArray(r, ['usuarios','users','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createUser(body: any) {
    return this.http.post<any>(`${this.base}/users`, body).pipe(catchError(this.handle));
  }
  updateUser(id: number, body: any) {
    return this.http.put<any>(`${this.base}/users/${id}`, body).pipe(catchError(this.handle));
  }
  deleteUser(id: number) {
    return this.http.delete<any>(`${this.base}/users/${id}`).pipe(catchError(this.handle));
  }
  getRoles() {
    return this.http.get<any>(`${this.base}/roles`)
      .pipe(
        map(r => this.extractArray(r, ['roles','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  setTempPassword(id: number, password: string) {
    return this.http.post<any>(`${this.base}/users/${id}/temp-password`, { password }).pipe(catchError(this.handle));
  }

  //=================[Areas]=========
  getAreas() {
    return this.http.get<any>(`${this.base}/areas`)
      .pipe(
        map(r => this.extractArray(r, ['areas','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createArea(body: any) {
    return this.http.post<any>(`${this.base}/areas`, body).pipe(catchError(this.handle));
  }
  deleteArea(id: number) {
    return this.http.delete<any>(`${this.base}/areas/${id}`).pipe(catchError(this.handle));
  }

  //=================[Lines]=========
  getLines(params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/lines`, { params })
      .pipe(
        map(r => this.extractArray(r, ['lines','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createLine(body: any) {
    return this.http.post<any>(`${this.base}/lines`, body).pipe(catchError(this.handle));
  }
  deleteLine(id: number) {
    return this.http.delete<any>(`${this.base}/lines/${id}`).pipe(catchError(this.handle));
  }

  //=================[Programs]=========
  getPrograms(params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/programs`, { params })
      .pipe(
        map(r => this.extractArray(r, ['programs','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createProgram(body: any) {
    return this.http.post<any>(`${this.base}/programs`, body).pipe(catchError(this.handle));
  }
  deleteProgram(id: number) {
    return this.http.delete<any>(`${this.base}/programs/${id}`).pipe(catchError(this.handle));
  }

  //=================[Operations]=========
  getOperations(params: Record<string, any> = {}) {
    return this.http.get<any>(`${this.base}/operations`, { params })
      .pipe(
        map(r => this.extractArray(r, ['operations','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createOperation(body: any) {
    return this.http.post<any>(`${this.base}/operations`, body).pipe(catchError(this.handle));
  }
  deleteOperation(id: number) {
    return this.http.delete<any>(`${this.base}/operations/${id}`).pipe(catchError(this.handle));
  }

  //=================[Approval Scopes]=========
  getApprovalScopes() {
    return this.http.get<any>(`${this.base}/approval-scopes`)
      .pipe(
        map(r => this.extractArray(r, ['approval_scopes','scopes','data','items','rows','result','results'])),
        catchError(this.handle)
      );
  }
  createApprovalScope(body: any) {
    return this.http.post<any>(`${this.base}/approval-scopes`, body).pipe(catchError(this.handle));
  }
  deleteApprovalScope(id: number) {
    return this.http.delete<any>(`${this.base}/approval-scopes/${id}`).pipe(catchError(this.handle));
  }
}
