# Nature Fly Fishing — competiciones oficiales

Plataforma web para gestionar competiciones de pesca con mosca: participantes, capturas, clasificación en directo y exportación de resultados (Excel y PDF). Incluye una zona pública con las competiciones publicadas y un panel privado para organizadores y jueces.

## Stack

- **Svelte 5** (runes) y **SvelteKit**, con `adapter-vercel`
- **Tailwind CSS**
- **PostgreSQL** (Neon, vía Vercel) con **Drizzle ORM**
- **Vitest** y **Playwright** para los tests
- **Bun** como gestor de paquetes

## Niveles de competición

Cada competición tiene un nivel que determina su ámbito:

| Nivel | Ubicación |
| --- | --- |
| Nacional | Sin comunidad ni provincia |
| Autonómica | Una comunidad autónoma |
| Provincial | Una comunidad autónoma y una provincia |
| Open | Sin ubicación: libre, abierta a cualquier participante |

## Primeros pasos

Requisitos: [Bun](https://bun.sh) y una base de datos PostgreSQL.

```bash
bun install
cp .env.example .env.local   # y rellena las variables (ver abajo)
bun run db:setup             # migraciones + usuario administrador inicial
bun run dev                  # http://localhost:5173
```

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `POSTGRES_URL` | Cadena de conexión a PostgreSQL |
| `POSTGRES_URL_NON_POOLING` | Conexión sin pooler, preferida para migraciones |
| `JWT_SECRET` | Clave para firmar las sesiones. **Obligatoria en producción** |

Si falta `JWT_SECRET`, el código usa un valor de desarrollo público: nunca lo dejes así fuera de tu máquina. Con Vercel puedes traer las variables con `bunx vercel env pull .env.local`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run preview` | Sirve el build en local |
| `bun run check` | `svelte-check` sobre TypeScript y Svelte |
| `bun run test` | Tests |
| `bun run test:coverage` | Tests con cobertura (umbral del 80 %) |
| `bun run db:migrate` | Aplica las migraciones pendientes (`db:migrate:dry` para simular) |
| `bun run db:setup` | Migraciones y usuario administrador inicial |
| `bun run db:generate` | Genera una migración a partir del esquema |
| `bun run db:studio` | Explorador visual de la base de datos |

`db:setup` crea el usuario `admin@campeonato.es` con la contraseña `admin1234` y rol `super_admin`. Cámbiala si la base de datos no es solo de pruebas.

Los tests de componentes (`*.svelte.test.ts`) corren en Chromium: la primera vez ejecuta `bunx playwright install chromium`.

## Estructura

```
src/
  routes/       páginas y APIs (SvelteKit)
    panel/      zona privada
    competiciones/  zona pública
    api/        endpoints REST
  lib/          lógica compartida, componentes y consultas
  db/           esquema de Drizzle
drizzle/        migraciones SQL
scripts/        migraciones y setup de la base de datos
```

## Roles

`super_admin`, `admin`, `organizador` y `juez`. Solo el `super_admin` crea competiciones.

## Flujo de trabajo

- `main` está protegida: todo entra por pull request con los checks `Tipos` y `Tests y cobertura` en verde.
- Una rama y una PR por funcionalidad (`feature/…`, `fix/…`, `chore/…`).
- Antes de abrir la PR: `bun run check`, `bun run test:coverage` y `bun run build`.
- Cada PR genera un despliegue de preview en Vercel.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): comprueba tipos y ejecuta los tests con cobertura en PRs hacia `main` y en cada push a `main`.
- **CD** (`.github/workflows/cd-vercel.yml`): despliega a producción cuando el CI termina en verde en `main`. Necesita los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` en el entorno `production` de GitHub.
