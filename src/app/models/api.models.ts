//=================[Modelos de API Optimizados]=========

//=================[Tipos Genéricos]=========
export interface ApiResponse<T> {
  data?: T;
  items?: T;
  rows?: T;
  result?: T;
  results?: T;
  [key: string]: any;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  total?: number;
  count?: number;
  pages?: number;
}

//=================[Interfaces de Entidades]=========
export interface Operation {
  id: number;
  nombre: string;
  code?: string;
  description?: string;
}

export interface Area {
  id: number;
  nombre: string;
  code?: string;
}

export interface Line {
  id: number;
  nombre: string;
  code?: string;
  area_id?: number;
}

export interface Program {
  id: number;
  nombre: string;
  code?: string;
  line_id?: number;
}

export interface User {
  id: number;
  employee_number: string;
  name: string;
  email?: string;
  active?: boolean;
}

//=================[Interfaces de Certificación]=========
export interface CreateCertPayload {
  employee_number: string;
  trainer_employee_number?: string;
  operation_id: number;
  porcentaje: 25 | 50 | 75 | 100;
  fecha_certificacion: string;
  notas?: string | null;
}

export interface UpdateCertPayload {
  employee_number: string;
  operation_id: number;
  porcentaje: 25 | 50 | 75 | 100;
  notas?: string | null;
}

//=================[Utilidades de Tipado]=========
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ApiEndpoint = 'areas' | 'lines' | 'programs' | 'operations' | 'users' | 'certifiers';

//=================[Constantes de API]=========
export const API_ENDPOINTS = {
  AREAS: '/areas',
  LINES: '/lines', 
  PROGRAMS: '/programs',
  OPERATIONS: '/operations',
  USERS: '/users',
  CERTIFIERS: '/certifiers',
  CERTIFIERS_BY_EMPLOYEE: '/certifiers-by-employee',
  CERTIFIERS_WITH_USERS: '/certifiers-with-users'
} as const;
