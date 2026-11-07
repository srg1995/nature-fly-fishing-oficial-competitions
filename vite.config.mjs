import { sveltekit } from "@sveltejs/kit/vite";
import { playwright } from "@vitest/browser-playwright";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // Vite no vuelca .env / .env.local en process.env, que es de donde leen
  // @vercel/postgres y auth-server. En tests no se carga para que sean deterministas.
  if (mode !== "test") {
    const env = loadEnv(mode, process.cwd(), "");
    for (const [key, value] of Object.entries(env)) {
      process.env[key] ??= value;
    }
  }

  return {
    plugins: [sveltekit()],
    test: {
      // Tests de componentes (*.svelte.test.ts) en un navegador real
      projects: [
        {
          extends: true,
          test: {
            name: "client",
            include: ["src/**/*.svelte.test.ts"],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" }],
            },
          },
        },
        {
          extends: true,
          test: {
            name: "server",
            environment: "node",
            include: ["src/**/*.test.ts"],
            exclude: ["src/**/*.svelte.test.ts"],
          },
        },
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: [
          "src/hooks.server.ts",
          "src/lib/puntuacion.ts",
          "src/lib/utils.ts",
          "src/lib/auth-server.ts",
          "src/lib/auth-competition.ts",
          "src/lib/validations.ts",
          "src/lib/validations-competition.ts",
          "src/lib/excel.ts",
          "src/lib/components/ui/**/*.svelte",
        ],
        // El CI falla si la cobertura baja de estos umbrales
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  };
});
