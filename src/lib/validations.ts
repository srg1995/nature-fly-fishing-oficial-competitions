import { z } from "zod";

export const createParticipanteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  plica: z.string().max(50).default(""),
  club: z.string().max(100).default(""),
  turno: z.enum(["A", "B"]).default("A"),
  tramo: z.string().max(100).default(""),
  rio: z.string().max(100).default(""),
});

export const updateParticipanteSchema = createParticipanteSchema.partial();

export const createCatchSchema = z.object({
  pescadorId: z.string().uuid("ID de pescador inválido"),
  sessionId: z.string().uuid().nullable().optional(),
  manga: z.number().int().min(1, "La manga debe ser al menos 1").max(10),
  tramo: z.string().max(100).default(""),
  rio: z.string().max(100).default(""),
  longitudCm: z
    .number()
    .min(1, "La longitud debe ser mayor que 0")
    .max(200, "Longitud máxima 200 cm"),
  valida: z.boolean().default(true),
  hora: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)")
    .nullable()
    .optional(),
  observaciones: z.string().max(500).default(""),
  juezId: z.string().uuid().nullable().optional(),
});

export const updateCatchSchema = createCatchSchema.partial();

export const createSessionSchema = z.object({
  pescadorId: z.string().uuid("ID de pescador inválido"),
  manga: z.number().int().min(1).max(10),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM")
    .nullable()
    .optional(),
  horaFin: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM")
    .nullable()
    .optional(),
  juez: z.string().max(200).default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre: z.string().min(2).max(100),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rol: z.enum(["admin", "organizador", "juez"]).default("juez"),
});

export type CreateParticipanteFormValues = z.infer<typeof createParticipanteSchema>;
export type UpdateParticipanteFormValues = z.infer<typeof updateParticipanteSchema>;
export type CreateCatchFormValues = z.infer<typeof createCatchSchema>;
export type UpdateCatchFormValues = z.infer<typeof updateCatchSchema>;
export type CreateSessionFormValues = z.infer<typeof createSessionSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
