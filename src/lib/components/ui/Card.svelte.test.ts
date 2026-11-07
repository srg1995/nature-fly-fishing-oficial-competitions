import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Card from "./Card.svelte";

const children = createRawSnippet(() => ({ render: () => "<p>contenido</p>" }));

describe("Card", () => {
  it("muestra el título y el contenido", async () => {
    render(Card, { title: "Resumen", children });
    await expect.element(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
    await expect.element(page.getByText("contenido")).toBeVisible();
  });

  it("omite el título si no se indica", async () => {
    render(Card, { children });
    await expect.element(page.getByRole("heading")).not.toBeInTheDocument();
  });
});
