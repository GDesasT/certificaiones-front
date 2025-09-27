//=================[Tipos Base]=========
export type EstadoCertificacion = 'Activa' | 'Actualizada' | 'Vencida' | 'Suspendida';
export type PorcentajeCertificacion = 25 | 50 | 75 | 100;

//=================[Interfaces Principales]=========
export interface EmpleadoBase {
  numeroEmpleado: string;
  nombre: string;
}

export interface Empleado extends EmpleadoBase {
  linea: string;
  operacion: string;
  programa: string;
}

export interface CompetenciaBase {
  id: string;
  descripcion: string;
  cumplida: boolean;
}

export interface Competencia extends CompetenciaBase {}

export interface CompetenciaPorcentaje {
  porcentaje: PorcentajeCertificacion;
  competencias: Competencia[];
}

//=================[Interfaces de Formularios]=========
export interface FormularioCertificacion extends EmpleadoBase {
  linea: string;
  operacion: string;
  programa: string;
  fechaEvaluacion: Date;
  porcentajeCertificacion: PorcentajeCertificacion;
  competenciasCumplidas: string[];
}

//=================[Interface Unificada de Certificaciones]=========
export interface CertificacionBase extends EmpleadoBase {
  linea: string;
  operacion: string;
  programa: string;
  porcentajeCertificacion: PorcentajeCertificacion;
  estado: EstadoCertificacion;
}

// Certificación para crear/editar
export interface Certificacion extends CertificacionBase {
  id?: string;
  fechaEvaluacion: Date;
  fechaCreacion: Date;
}

// Certificación con historial completo
export interface CertificacionHistorial extends CertificacionBase {
  id: string;
  fechaCertificacion: Date;
  entrenador: string;
  area?: string; // Campo opcional para extensiones
}

//=================[Mock Data - Solo Competencias Utilizadas]=========
// IMPORTANTE: Solo mantener mock data que realmente se usa en la aplicación
// Estas competencias SÍ se utilizan en certificar.ts

export const COMPETENCIAS_25_MOCK: Competencia[] = [
  { id: '25-1', descripcion: 'Aspectos de la operación: Nombre, numero, cliente, programa, características de la operación', cumplida: false },
  { id: '25-2', descripcion: 'Instrucciones de trabajo: Comprensión, lectura, ubicación, contenido, etc.', cumplida: false },
  { id: '25-3', descripcion: 'Conoce las [CC] y [SC] de su operación', cumplida: false },
  { id: '25-4', descripcion: 'Conoce el embarrado de su máquina', cumplida: false },
  { id: '25-5', descripcion: 'Colocación correcta de forma y carrete', cumplida: false },
  { id: '25-6', descripcion: 'Defectos más comunes en su operación', cumplida: false },
  { id: '25-7', descripcion: 'Liberación del contexto funcionamiento del poka yoke con las piezas master', cumplida: false }
];

export const COMPETENCIAS_50_MOCK: Competencia[] = [
  { id: '50-1', descripcion: 'Conocimiento de materia prima: componentes, especificaciones, etc.', cumplida: false },
  { id: '50-2', descripcion: 'Uso de maquinaria: verificación, calibración, etc.', cumplida: false },
  { id: '50-3', descripcion: 'Manejo de producto de no conforme: protocolo y plan de reacción, etc.', cumplida: false },
  { id: '50-4', descripcion: 'Reacción ante un incidente (reacción previa, durante y después realizada la operación)', cumplida: false },
  { id: '50-5', descripcion: 'Realiza el método correcto descrito a la instrucción de trabajo', cumplida: false },
  { id: '50-6', descripcion: 'Requerimientos de calidad de la operación', cumplida: false },
  { id: '50-7', descripcion: 'Herramientas de su estación de trabajo/TPM', cumplida: false },
  { id: '50-8', descripcion: 'Dispositivos de seguridad en la operación: paros de emergencia y guardas', cumplida: false },
  { id: '50-9', descripcion: 'Conoce su cadena de contactos y procesos de escalación', cumplida: false },
  { id: '50-10', descripcion: 'Detecta condiciones Anormales en su proceso (Andon/poka yoke/conteo el producto)', cumplida: false },
  { id: '50-11', descripcion: 'Reconoce la importancia de no hacer reparaciones y conoce su consecuencias', cumplida: false },
  { id: '50-12', descripcion: 'Conoce los Objetivos Ambientales/Conoce objetivos de la operación', cumplida: false }
];

export const COMPETENCIAS_75_MOCK: Competencia[] = [
  { id: '75-1', descripcion: 'Llenado correcto de check list de calidad', cumplida: false },
  { id: '75-2', descripcion: 'Realización del TPM', cumplida: false },
  { id: '75-3', descripcion: 'Uso correcto de contador de piezas por carrete', cumplida: false },
  { id: '75-4', descripcion: 'Uso correcto de piezas master para el Funcionamiento de los Pokà Yoke basándose en la instrucción de trabajo', cumplida: false },
  { id: '75-5', descripcion: 'Conocimiento de los modos de falla de la operación', cumplida: false },
  { id: '75-6', descripcion: 'Manejo de herramienta de la operación (TPM-Check list de calidad)', cumplida: false },
  { id: '75-7', descripcion: 'Identificación, verificación y uso de herramientas de calidad', cumplida: false },
  { id: '75-8', descripcion: '[CC] y [SC] de la operación', cumplida: false },
  { id: '75-9', descripcion: 'Conocimiento Alertas de Calidad en la operación', cumplida: false },
  { id: '75-10', descripcion: 'Clasificación de defectos: Rangos A, B y C', cumplida: false },
  { id: '75-11', descripcion: 'Concentración de la seguridad del producto', cumplida: false },
  { id: '75-12', descripcion: 'El operador realiza su proceso acorde a la instrucción de trabajo', cumplida: false }
];

export const COMPETENCIAS_100_MOCK: Competencia[] = [
  { id: '100-1', descripcion: 'La persona es capaz de entrenar a otros operadores en la operación entrenada', cumplida: false }
];