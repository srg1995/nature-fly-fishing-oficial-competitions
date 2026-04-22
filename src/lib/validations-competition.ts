import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

const baseFields = {
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200),
  edicion: z.string().max(50).default(""),
  modalidad: z.string().max(100).default("lance_mosca_duos"),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido (minúsculas, números y guiones)"
    ),
  estado: z
    .enum(["borrador", "publicada", "en_curso", "finalizada", "archivada"])
    .default("borrador"),
  fechaInicio: isoDate,
  fechaFin: isoDate,
  lugar: z.string().max(200).default(""),
  organizador: z.string().max(200).default(""),
  organizadorUserId: z.string().uuid().nullable().default(null),
  totalMangas: z.number().int().min(1).max(10).default(4),
  minimaLongitud: z.number().min(1).max(100).default(19),
  rios: z.array(z.string().max(100)).default([]),
  tramos: z.array(z.string().max(100)).default([]),
  descripcion: z.string().max(4000).default(""),
};

const nacionalSchema = z.object({
  ...baseFields,
  nivel: z.literal("nacional"),
  comunidadAutonomaId: z.null().default(null),
  provinciaId: z.null().default(null),
});

const autonomicaSchema = z.object({
  ...baseFields,
  nivel: z.literal("autonomica"),
  comunidadAutonomaId: z.number().int().positive(),
  provinciaId: z.null().default(null),
});

const provincialSchema = z.object({
  ...baseFields,
  nivel: z.literal("provincial"),
  comunidadAutonomaId: z.number().int().positive(),
  provinciaId: z.number().int().positive(),
});

export const createCompetitionSchema = z
  .discriminatedUnion("nivel", [
    nacionalSchema,
    autonomicaSchema,
    provincialSchema,
  ])
  .refine((data) => data.fechaFin >= data.fechaInicio, {
    message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
    path: ["fechaFin"],
  });

export const updateCompetitionSchema = z.object({
  nombre: baseFields.nombre.optional(),
  edicion: baseFields.edicion.optional(),
  modalidad: baseFields.modalidad.optional(),
  estado: baseFields.estado.optional(),
  fechaInicio: isoDate.optional(),
  fechaFin: isoDate.optional(),
  lugar: baseFields.lugar.optional(),
  organizador: baseFields.organizador.optional(),
  organizadorUserId: z.string().uuid().nullable().optional(),
  totalMangas: baseFields.totalMangas.optional(),
  minimaLongitud: baseFields.minimaLongitud.optional(),
  rios: baseFields.rios.optional(),
  tramos: baseFields.tramos.optional(),
  descripcion: baseFields.descripcion.optional(),
});

export type CreateCompetitionFormValues = z.infer<typeof createCompetitionSchema>;
export type UpdateCompetitionFormValues = z.infer<typeof updateCompetitionSchema>;

export function generateSlug(nombre: string, edicion?: string): string {
  const base = [nombre, edicion]
    .filter((x): x is string => Boolean(x))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "competicion";
}
