import { Activity } from "lucide-react";
import type { AuditEntry } from "@/types";

export interface AuditEntryWithUser extends AuditEntry {
  userName?: string | null;
}

interface Props {
  entries: AuditEntryWithUser[];
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedActividad({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
        Sin actividad reciente
      </div>
    );
  }
  return (
    <div className="border rounded-lg divide-y">
      {entries.map((e) => (
        <div key={e.id} className="p-3 flex items-start gap-3 text-sm">
          <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-x-2">
              <span className="font-medium">{e.userName ?? "Sistema"}</span>
              <span className="text-muted-foreground">{e.accion}</span>
              {e.tabla ? (
                <span className="text-muted-foreground">· {e.tabla}</span>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(e.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
