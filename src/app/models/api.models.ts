// src/app/models/api.models.ts
export interface Operation {
  id: number;
  nombre: string; // ajusta al campo real (name, title, etc.) que devuelva tu API
}

export interface CreateCertPayload {
  employee_number: string;
  operation_id: number;
  porcentaje: number;
  fecha_certificacion: string; // 'YYYY-MM-DD'
  notas?: string | null;
}

export interface ApiList<T> { [key: string]: T[] } // p.ej. { operations: Operation[] }
