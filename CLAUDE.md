# Nature Fly Fishing — competiciones oficiales

Proyecto en migración de Next.js (React) a Svelte 5 + SvelteKit (adapter Vercel). Gestor de paquetes: bun.

## Flujo de trabajo (equipo de desarrollo)

- `main` está protegida: todo cambio entra por PR con el CI (jobs `Tipos` y `Tests y cobertura`) en verde. Nunca push directo a `main`.
- Una rama y un PR por funcionalidad. Nombres: `feature/...`, `bugfix/...`, `hotfix/...`, `chore/...`.
- Cada rama sale de `main` actualizada (`git checkout main && git pull`).
- **Pedir autorización expresa al usuario antes de cada COMMIT** (y de la creación de ramas). Una vez autorizado el commit, el push de la rama y la creación del PR se hacen sin volver a preguntar. Migración terminada: esta regla vuelve a ser obligatoria.
- Nunca hacer merge de PR: lo hace el usuario tras revisar.
- Commits en español, estilo convencional (`feat:`, `fix:`, `chore:`), terminando con el trailer de Co-Authored-By indicado por el sistema.
- Antes de commitear: `bun run check`, `bun run test:coverage` y `bun run build` deben pasar.

## Reglas de código

- TypeScript sin tipos `any`.
- Svelte 5 + SvelteKit: rutas en `src/routes` (`+page.server.ts`, `+server.ts`), lógica compartida en `src/lib`.
- Accesibilidad: cada `<label>` asociado a su control (`for`/`id`).

## Estado de la migración

Migración de Next.js a SvelteKit completada (Next, React y Radix eliminados). Stack: Svelte 5 (runes), SvelteKit, Tailwind, Drizzle + Vercel Postgres.
Estructura: rutas y APIs en `src/routes`, componentes en `src/lib/components`, acceso a datos en `src/lib` y `src/db`.

## Tests

Vitest (`bun run test`, `bun run test:coverage`). Los `*.svelte.test.ts` corren en Chromium con Playwright (`bunx playwright install chromium`); el resto en Node. Umbral de cobertura del 80 % sobre los archivos listados en `vite.config.mjs`: al añadir código con lógica, añade su test y amplía el `include`.

## CD

`cd-vercel.yml` despliega a producción tras CI verde en `main`. 
