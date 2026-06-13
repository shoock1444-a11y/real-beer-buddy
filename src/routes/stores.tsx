import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/stores")({
  head: () => ({ meta: [{ title: "Магазини — Real Beer" }] }),
  component: StoresPage,
});

function StoresPage() {
  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell>
      <PageHeader title="Наші магазини" subtitle="Real Beer у твоєму місті" />
      <ul className="space-y-3 px-4 pt-4">
        {stores?.map((s) => (
          <li key={s.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="relative h-32 overflow-hidden bg-gradient-amber">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur">
                  📍 {s.city}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold">{s.name}</h3>
              <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <Line icon={<MapPin className="h-4 w-4" />}>{s.address}</Line>
                {s.hours && <Line icon={<Clock className="h-4 w-4" />}>{s.hours}</Line>}
                {s.phone && <Line icon={<Phone className="h-4 w-4" />}><a href={`tel:${s.phone}`}>{s.phone}</a></Line>}
              </div>
              {s.latitude && s.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Navigation className="h-3.5 w-3.5" /> Прокласти маршрут
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

function Line({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
