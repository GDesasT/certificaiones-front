export interface Empleado {
  numeroEmpleado: string;
  nombre: string;
  linea: string;
  operacion: string;
  programa: string;
}

export interface Competencia {
  id: string;
  descripcion: string;
  cumplida: boolean;
}

export interface CompetenciaPorcentaje {
  porcentaje: number;
  competencias: Competencia[];
}

export interface FormularioCertificacion {
  numeroEmpleado: string;
  nombre: string;
  linea: string;
  operacion: string;
  programa: string;
  fechaEvaluacion: Date;
  porcentajeCertificacion: number;
  competenciasCumplidas: string[];
}

export interface Certificacion {
  id?: string;
  numeroEmpleado: string;
  nombre: string;
  linea: string;
  operacion: string;
  programa: string;
  fechaEvaluacion: Date;
  porcentajeCertificacion: number;
  fechaCreacion: Date;
}

export interface CertificacionHistorial {
  id: string;
  numeroEmpleado: string;
  nombre: string;
  linea: string;
  operacion: string;
  programa: string;
  porcentajeCertificacion: number;
  fechaCertificacion: Date;
  entrenador: string;
  estado: 'Activa' | 'Actualizada';
}

// Datos mockeados para desarrollo frontend
export const LINEAS_MOCK = [
  'Línea 1 - Ensamble',
  'Línea 2 - Soldadura',
  'Línea 3 - Pintura',
  'Línea 4 - Control de Calidad',
  'Línea 5 - Empaque'
];

export const OPERACIONES_MOCK = [
  'Operación A - Corte',
  'Operación B - Doblez',
  'Operación C - Ensamble',
  'Operación D - Inspección',
  'Operación E - Acabado'
];

export const PROGRAMAS_MOCK = [
  'Programa Básico',
  'Programa Intermedio',
  'Programa Avanzado',
  'Programa Especializado'
];

export const EMPLEADOS_MOCK: Empleado[] = [
  { numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico' },
  { numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico' },
  { numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico' },
  { numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP01 - Costura Panel Frontal', programa: 'PG02 - Intermedio' },
  { numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP01 - Costura Doble Pespunte', programa: 'PG03 - Avanzado' },
  { numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP01 - Inspección Visual', programa: 'PG04 - Especializado' }
];

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

// Historial de certificaciones mock
export const CERTIFICACIONES_HISTORIAL_MOCK: CertificacionHistorial[] = [
  // Juan Gerardo Alcantar - 6685 - Línea 1: Costura de Base (16 operaciones)
  { id: 'cert-001', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-15'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-002', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP02 - Costura Lateral Izquierda', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-01-20'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-003', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP03 - Costura Lateral Derecha', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-01-22'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-004', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP04 - Refuerzo de Esquinas', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-25'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-005', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP05 - Costura de Cierre Superior', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-02-01'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-006', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP06 - Pespunte Perimetral', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-05'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-007', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP07 - Dobladillo Interno', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-08'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-008', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP08 - Costura de Refuerzo Central', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-10'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-009', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP09 - Acabado de Bordes', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-12'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-010', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP10 - Instalación de Ojetes', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-02-15'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-011', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP11 - Control de Calidad Visual', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-18'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-012', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP12 - Prueba de Tensión', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-20'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-013', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP13 - Marcado de Lote', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-22'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-014', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP14 - Empaque Primario', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-25'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-015', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP15 - Verificación Dimensional', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-28'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-016', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L1 - Costura de Base', operacion: 'OP16 - Inspección Final', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-01'), entrenador: 'María González', estado: 'Activa' },

  // Juan Gerardo Alcantar - Línea 2: Costura de Paneles (16 operaciones)
  { id: 'cert-017', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP01 - Costura Panel Frontal', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-05'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-018', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP02 - Costura Panel Trasero', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-08'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-019', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP03 - Unión de Paneles Laterales', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-10'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-020', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP04 - Costura de Válvula', programa: 'PG02 - Intermedio', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-12'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-021', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP05 - Instalación de Conectores', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-15'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-022', numeroEmpleado: '6685', nombre: 'Juan Gerardo Alcantar', linea: 'L2 - Costura de Paneles', operacion: 'OP06 - Costura de Refuerzo Diagonal', programa: 'PG02 - Intermedio', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-18'), entrenador: 'Carlos Herrera', estado: 'Activa' },

  // Nestor Daniel Cabrera Garcia - 7218 - Línea 1: Costura de Base (16 operaciones)
  { id: 'cert-101', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-18'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-102', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP02 - Costura Lateral Izquierda', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-25'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-103', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP03 - Costura Lateral Derecha', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-28'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-104', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP04 - Refuerzo de Esquinas', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-02'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-105', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP05 - Costura de Cierre Superior', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-05'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-106', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP06 - Pespunte Perimetral', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-08'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-107', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP07 - Dobladillo Interno', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-10'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-108', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP08 - Costura de Refuerzo Central', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-12'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-109', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP09 - Acabado de Bordes', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-15'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-110', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP10 - Instalación de Ojetes', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-18'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-111', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP11 - Control de Calidad Visual', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-20'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-112', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP12 - Prueba de Tensión', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-22'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-113', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP13 - Marcado de Lote', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-25'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-114', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP14 - Empaque Primario', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-28'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-115', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP15 - Verificación Dimensional', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-01'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-116', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L1 - Costura de Base', operacion: 'OP16 - Inspección Final', programa: 'PG01 - Básico', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-03'), entrenador: 'María González', estado: 'Activa' },

  // Nestor Daniel Cabrera Garcia - Línea 3: Costura Avanzada (16 operaciones)
  { id: 'cert-117', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L3 - Costura Avanzada', operacion: 'OP01 - Costura Doble Pespunte', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-08'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-118', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L3 - Costura Avanzada', operacion: 'OP02 - Costura de Refuerzo Cruzado', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-10'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-119', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L3 - Costura Avanzada', operacion: 'OP03 - Instalación de Sensores', programa: 'PG03 - Avanzado', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-12'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-120', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L3 - Costura Avanzada', operacion: 'OP04 - Costura Multifilamento', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-15'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-121', numeroEmpleado: '7218', nombre: 'Nestor Daniel Cabrera Garcia', linea: 'L3 - Costura Avanzada', operacion: 'OP05 - Programación de Patrones', programa: 'PG03 - Avanzado', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-18'), entrenador: 'Ana Martínez', estado: 'Activa' },

  // Ana Patricia Rivera - 5432 - Nueva empleada (8 operaciones)
  { id: 'cert-201', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP01 - Costura Principal Inferior', programa: 'PG01 - Básico', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-15'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-202', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP02 - Costura Lateral Izquierda', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-18'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-203', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP03 - Costura Lateral Derecha', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-20'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-204', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP04 - Refuerzo de Esquinas', programa: 'PG01 - Básico', porcentajeCertificacion: 25, fechaCertificacion: new Date('2024-03-22'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-205', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP05 - Costura de Cierre Superior', programa: 'PG01 - Básico', porcentajeCertificacion: 25, fechaCertificacion: new Date('2024-03-25'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-206', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP06 - Pespunte Perimetral', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-28'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-207', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP07 - Dobladillo Interno', programa: 'PG01 - Básico', porcentajeCertificacion: 25, fechaCertificacion: new Date('2024-04-01'), entrenador: 'María González', estado: 'Activa' },
  { id: 'cert-208', numeroEmpleado: '5432', nombre: 'Ana Patricia Rivera', linea: 'L1 - Costura de Base', operacion: 'OP08 - Costura de Refuerzo Central', programa: 'PG01 - Básico', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-04-05'), entrenador: 'María González', estado: 'Activa' },

  // Roberto Carlos Mendoza - 8765 - Empleado intermedio (12 operaciones)
  { id: 'cert-301', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP01 - Costura Panel Frontal', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-10'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-302', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP02 - Costura Panel Trasero', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-12'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-303', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP03 - Unión de Paneles Laterales', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-15'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-304', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP04 - Costura de Válvula', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-18'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-305', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP05 - Instalación de Conectores', programa: 'PG02 - Intermedio', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-03-20'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-306', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP06 - Costura de Refuerzo Diagonal', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-22'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-307', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP07 - Sellado de Costuras', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-25'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-308', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP08 - Control de Presión', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-28'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-309', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP09 - Pruebas de Hermeticidad', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-04-01'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-310', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP10 - Marcado de Identificación', programa: 'PG02 - Intermedio', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-04-05'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-311', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP11 - Inspección de Acabado', programa: 'PG02 - Intermedio', porcentajeCertificacion: 50, fechaCertificacion: new Date('2024-04-08'), entrenador: 'Carlos Herrera', estado: 'Activa' },
  { id: 'cert-312', numeroEmpleado: '8765', nombre: 'Roberto Carlos Mendoza', linea: 'L2 - Costura de Paneles', operacion: 'OP12 - Preparación para Envío', programa: 'PG02 - Intermedio', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-04-10'), entrenador: 'Carlos Herrera', estado: 'Activa' },

  // María José Herrera - 1234 - Empleado avanzado (10 operaciones)
  { id: 'cert-401', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP01 - Costura Doble Pespunte', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-15'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-402', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP02 - Costura de Refuerzo Cruzado', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-18'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-403', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP03 - Instalación de Sensores', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-20'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-404', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP04 - Costura Multifilamento', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-25'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-405', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP05 - Programación de Patrones', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-28'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-406', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP06 - Costura de Precisión Láser', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-05'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-407', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP07 - Control Automático de Tensión', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-08'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-408', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP08 - Soldadura Ultrasónica', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-12'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-409', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP09 - Inspección Dimensional 3D', programa: 'PG03 - Avanzado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-03-15'), entrenador: 'Ana Martínez', estado: 'Activa' },
  { id: 'cert-410', numeroEmpleado: '1234', nombre: 'María José Herrera', linea: 'L3 - Costura Avanzada', operacion: 'OP10 - Certificación de Calidad Final', programa: 'PG03 - Avanzado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-03-18'), entrenador: 'Ana Martínez', estado: 'Activa' },

  // Carlos Alberto López - 9876 - Especialista en Control de Calidad (8 operaciones)
  { id: 'cert-501', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP01 - Inspección Visual', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-10'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-502', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP02 - Pruebas de Resistencia', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-15'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-503', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP03 - Análisis Dimensional', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-20'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-504', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP04 - Pruebas de Hermeticidad', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-01-25'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-505', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP05 - Certificación de Lote', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-01'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-506', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP06 - Documentación de Calidad', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-05'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-507', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP07 - Auditoría de Procesos', programa: 'PG04 - Especializado', porcentajeCertificacion: 75, fechaCertificacion: new Date('2024-02-10'), entrenador: 'Pedro Ruiz', estado: 'Activa' },
  { id: 'cert-508', numeroEmpleado: '9876', nombre: 'Carlos Alberto López', linea: 'L4 - Control de Calidad', operacion: 'OP08 - Validación de Equipos', programa: 'PG04 - Especializado', porcentajeCertificacion: 100, fechaCertificacion: new Date('2024-02-15'), entrenador: 'Pedro Ruiz', estado: 'Activa' }
];