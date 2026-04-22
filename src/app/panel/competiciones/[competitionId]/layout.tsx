import { notFound } from "next/navigation";
import { getCompetitionById } from "@/lib/queries/competitions";
import { CompetitionSidebar } from "@/components/layout/CompetitionSidebar";
import { Header } from "@/components/layout/Header";
import { CurrentCompetitionProvider } from "@/hooks/use-current-competition";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ competitionId: string }>;
}

export default async function CompetitionLayout({
  children,
  params,
}: LayoutProps) {
  const { competitionId } = await params;
  const competition = await getCompetitionById(competitionId);
  if (!competition) {
    notFound();
  }

  return (
    <CurrentCompetitionProvider competition={competition}>
      <div className="flex min-h-screen bg-background">
        <CompetitionSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </CurrentCompetitionProvider>
  );
}
