import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Alert from "./Alert.svelte";

describe("Alert", () => {
  it("muestra un error con role alert por defecto", async () => {
    render(Alert, { message: "Algo falló" });
    await expect.element(page.getByRole("alert")).toHaveTextContent("Algo falló");
  });

  it("muestra un éxito con role status", async () => {
    render(Alert, { message: "Guardado", kind: "success" });
    await expect.element(page.getByRole("status")).toHaveTextContent("Guardado");
  });
});
