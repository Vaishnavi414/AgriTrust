import { createFileRoute } from "@tanstack/react-router";
import { MapMeasurer } from "@/components/MapMeasurer";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Sprout } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Index,
  head: () => ({
    meta: [
      { title: "GeoFarm Measurer — Land Area Calculator for Farmers" },
      {
        name: "description",
        content:
          "Measure your farmland area in square meters, hectares, and acres using GPS and an interactive map. Built for farmers.",
      },
      { property: "og:title", content: "GeoFarm Measurer" },
      {
        property: "og:description",
        content: "GPS-powered land area calculator for smart farming decisions.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="z-[500] flex items-center justify-between border-b border-border/60 bg-card/90 px-4 py-3 shadow-soft backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground shadow-soft">
            <Sprout className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight sm:text-xl">
              GeoFarm Measurer
            </h1>
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              Smart land area calculator for farmers
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground sm:flex">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          GPS ready
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <MapMeasurer />
        <ChatAssistant />
      </main>
    </div>
  );
}
