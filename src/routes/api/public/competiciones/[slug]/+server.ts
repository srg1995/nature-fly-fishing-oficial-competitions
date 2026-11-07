import { getCompetitionBySlug } from "$lib/queries/competitions";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { slug: string } }) {
  try {
    const competition = await getCompetitionBySlug(params.slug);

    if (
      !competition ||
      competition.estado === "borrador" ||
      competition.estado === "archivada"
    ) {
      return json({ error: "Competición no encontrada" }, { status: 404 });
    }

    return json({ data: competition });
  } catch (error) {
    console.error(error);
    return json({ error: "Error al obtener competición" }, { status: 500 });
  }
}
