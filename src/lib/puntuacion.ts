/**
 * Sistema de puntuación para el Campeonato Nacional de Salmónidos Lance Mosca Dúos
 *
 * Truchas válidas (>= 19 cm): 100 + (longitud × 20)
 * Truchas menores de 19 cm: 15 puntos fijos
 */

export const LONGITUD_MINIMA_VALIDA = 19;
export const PUNTOS_CAPTURA_PEQUEÑA = 15;
export const PUNTOS_BASE = 100;
export const PUNTOS_POR_CM = 20;

/**
 * Calcula los puntos de una captura según su longitud.
 * Solo se llama con capturas marcadas como válidas.
 */
export function calcularPuntos(longitudCm: number): number {
  if (longitudCm < LONGITUD_MINIMA_VALIDA) {
    return PUNTOS_CAPTURA_PEQUEÑA;
  }
  return PUNTOS_BASE + longitudCm * PUNTOS_POR_CM;
}

/**
 * Devuelve si una captura es de talla mínima reglamentaria.
 */
export function esTallaMinima(longitudCm: number): boolean {
  return longitudCm >= LONGITUD_MINIMA_VALIDA;
}

/**
 * Descripción legible del cálculo de puntos.
 */
export function describePuntuacion(longitudCm: number): string {
  if (longitudCm < LONGITUD_MINIMA_VALIDA) {
    return `${longitudCm} cm → ${PUNTOS_CAPTURA_PEQUEÑA} pts (menor de ${LONGITUD_MINIMA_VALIDA} cm)`;
  }
  const puntos = calcularPuntos(longitudCm);
  return `${longitudCm} cm → ${PUNTOS_BASE} + (${longitudCm} × ${PUNTOS_POR_CM}) = ${puntos} pts`;
}

/**
 * Calcula el total de puntos de un conjunto de capturas válidas.
 */
export function calcularTotalPuntos(
  capturas: Array<{ longitudCm: number; valida: boolean }>
): number {
  return capturas
    .filter((c) => c.valida)
    .reduce((sum, c) => sum + calcularPuntos(c.longitudCm), 0);
}

/**
 * Resuelve empates en clasificación:
 * 1º mayor número de capturas válidas
 * 2º mayor pieza (longitud máxima)
 */
export function resolverEmpate(
  a: { capturasValidas: number; mejorPieza: number },
  b: { capturasValidas: number; mejorPieza: number }
): number {
  if (b.capturasValidas !== a.capturasValidas) {
    return b.capturasValidas - a.capturasValidas;
  }
  return b.mejorPieza - a.mejorPieza;
}
