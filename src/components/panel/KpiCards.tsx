import { Trophy, Play, CheckCircle2, Users, Fish } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GlobalPanelStats } from "@/lib/queries/global-stats";

interface Props {
  stats: GlobalPanelStats;
}

export function KpiCards({ stats }: Props) {
  const items = [
    {
      label: "Competiciones",
      value: stats.totalCompeticiones,
      icon: Trophy,
      color: "text-primary",
    },
    {
      label: "En curso",
      value: stats.enCurso,
      icon: Play,
      color: "text-amber-600",
    },
    {
      label: "Finalizadas",
      value: stats.finalizadas,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      label: "Pescadores únicos",
      value: stats.pescadoresUnicos,
      icon: Users,
      color: "text-sky-600",
    },
    {
      label: "Capturas (24h)",
      value: stats.capturasUltimas24h,
      icon: Fish,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${item.color}`} />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="text-2xl font-bold tabular-nums">
                    {item.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
