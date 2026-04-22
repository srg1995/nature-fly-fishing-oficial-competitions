"use client";

import { createContext, useContext } from "react";
import type { Competition } from "@/types";

const CurrentCompetitionContext = createContext<Competition | null>(null);

export function CurrentCompetitionProvider({
  competition,
  children,
}: {
  competition: Competition;
  children: React.ReactNode;
}) {
  return (
    <CurrentCompetitionContext.Provider value={competition}>
      {children}
    </CurrentCompetitionContext.Provider>
  );
}

export function useCurrentCompetition(): Competition {
  const ctx = useContext(CurrentCompetitionContext);
  if (!ctx) {
    throw new Error(
      "useCurrentCompetition debe usarse dentro de CurrentCompetitionProvider"
    );
  }
  return ctx;
}
