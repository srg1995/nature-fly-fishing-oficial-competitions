// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "organizador" | "juez";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  createdAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// ─── Participante Individual ───────────────────────────────────────────────────
export interface Participante {
  id: string;
  nombre: string;
  plica: string;
  club: string;
  tramo: string;
  rio: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateParticipanteInput = Omit<Participante, "id" | "createdAt" | "updatedAt">;
export type UpdateParticipanteInput = Partial<CreateParticipanteInput>;

// ─── Catch Session ─────────────────────────────────────────────────────────────
export interface CatchSession {
  id: string;
  pescadorId: string;
  manga: number;
  horaInicio: string | null;
  horaFin: string | null;
  juez: string;
  createdAt: Date;
}

export type CreateSessionInput = Omit<CatchSession, "id" | "createdAt">;

// ─── Catch Record ──────────────────────────────────────────────────────────────
export interface CatchRecord {
  id: string;
  pescadorId: string;
  sessionId: string | null;
  manga: number;
  tramo: string;
  rio: string;
  longitudCm: number;
  puntos: number;
  valida: boolean;
  hora: string | null;
  observaciones: string;
  juezId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCatchInput = Omit<CatchRecord, "id" | "puntos" | "createdAt" | "updatedAt">;
export type UpdateCatchInput = Partial<Omit<CatchRecord, "id" | "createdAt" | "updatedAt">>;

// ─── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  userId: string | null;
  accion: string;
  tabla: string | null;
  registroId: string | null;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
  createdAt: Date;
}

// ─── Rankings & Stats ─────────────────────────────────────────────────────────
export interface PescadorStats {
  pescadorId: string;
  nombre: string;
  plica: string;
  club: string;
  tramo: string;
  rio: string;
  totalCapturas: number;
  capturasValidas: number;
  capturasMenores18: number;
  totalCm: number;
  totalPuntos: number;
  mejorPieza: number;
  posicion?: number;
}

export interface MangaStats {
  manga: number;
  totalCapturas: number;
  capturasValidas: number;
  totalPuntos: number;
  pescadoresParticipantes: number;
}

export interface DashboardStats {
  totalPescadores: number;
  totalCapturas: number;
  totalPuntos: number;
  mangasActivas: number;
  topPescadores: PescadorStats[];
  recentCatches: RecentCatch[];
  bestFish: BestFish[];
}

export interface RecentCatch extends CatchRecord {
  nombre: string;
}

export interface BestFish {
  id: string;
  longitudCm: number;
  puntos: number;
  nombre: string;
  manga: number;
  hora: string | null;
  createdAt: Date;
}

// ─── Competition Settings ─────────────────────────────────────────────────────
export interface CompetitionSettings {
  nombre: string;
  edicion: string;
  fecha: string;
  lugar: string;
  organizador: string;
  totalMangas: number;
  minimaLongitud: number;
  rios: string[];
  tramos: string[];
}

// ─── API Response wrappers ────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthSession {
  user: {
    id: string;
    email: string;
    nombre: string;
    rol: UserRole;
  };
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Excel Import ─────────────────────────────────────────────────────────────
export interface ImportParticipanteRow {
  nombre: string;
  plica: string;
  club: string;
  tramo: string;
  rio: string;
}

export interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string }>;
}
