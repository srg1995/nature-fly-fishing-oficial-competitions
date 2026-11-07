import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import StatCard from "./StatCard.svelte";

describe("StatCard", () => {
  it("muestra etiqueta y valor de texto", async () => {
    render(StatCard, { label: "Participantes", value: "12" });
    await expect.element(page.getByText("Participantes")).toBeVisible();
    await expect.element(page.getByText("12")).toBeVisible();
  });

  it("formatea los números en es-ES", async () => {
    render(StatCard, { label: "Puntos", value: 1500 });
    await expect.element(page.getByText(Number(1500).toLocaleString("es-ES"))).toBeVisible();
  });
});
