import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Crosshair, Trash2, Download, Radio, Pencil, Settings2, Cloud } from "lucide-react";

// Fix default marker icons (Leaflet + bundlers)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LatLng = { lat: number; lng: number };

const SQM_PER_HECTARE = 10_000;
const SQM_PER_ACRE = 4046.8564224;

export function MapMeasurer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const liveMarkerRef = useRef<L.CircleMarker | null>(null);
  const liveAccuracyRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [points, setPoints] = useState<LatLng[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [areaSqm, setAreaSqm] = useState(0);

  // GPS accuracy filter
  const [accuracyFilterEnabled, setAccuracyFilterEnabled] = useState(true);
  const [accuracyThreshold, setAccuracyThreshold] = useState(10); // meters
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const [acquiring, setAcquiring] = useState(false);
  const acquireWatchRef = useRef<number | null>(null);
  const acquireTimeoutRef = useRef<number | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Ensure container is mounted and has dimensions
    const container = containerRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Wait a tick for layout to settle
      const raf = requestAnimationFrame(() => {
        if (containerRef.current) {
          initMap(containerRef.current);
        }
      });
      return () => cancelAnimationFrame(raf);
    }

    initMap(container);

    function initMap(element: HTMLElement) {
      const map = L.map(element, {
        center: [20.5937, 78.9629], // India center as a friendly default
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: L.LeafletMouseEvent) => {
        setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      });

      mapRef.current = map;

      // Try to center on user once at start
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 17);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers + polygon whenever points change
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    points.forEach((p, idx) => {
      const m = L.marker([p.lat, p.lng], { draggable: editMode })
        .bindTooltip(`Point ${idx + 1}`, { permanent: false });
      m.on("dragend", (ev) => {
        const ll = (ev.target as L.Marker).getLatLng();
        setPoints((prev) =>
          prev.map((pt, i) => (i === idx ? { lat: ll.lat, lng: ll.lng } : pt)),
        );
      });
      m.on("contextmenu", () => {
        setPoints((prev) => prev.filter((_, i) => i !== idx));
      });
      m.addTo(layer);
    });

    if (points.length >= 2) {
      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      polygonRef.current = L.polygon(latlngs, {
        color: "hsl(148 50% 38%)",
        weight: 3,
        fillColor: "hsl(148 60% 55%)",
        fillOpacity: 0.25,
      }).addTo(map);
    }

    if (points.length >= 3) {
      const coords = [...points, points[0]].map((p) => [p.lng, p.lat]);
      const poly = turf.polygon([coords]);
      setAreaSqm(turf.area(poly));
    } else {
      setAreaSqm(0);
    }
  }, [points, editMode]);

  const stopAcquire = useCallback(() => {
    if (acquireWatchRef.current !== null) {
      navigator.geolocation.clearWatch(acquireWatchRef.current);
      acquireWatchRef.current = null;
    }
    if (acquireTimeoutRef.current !== null) {
      window.clearTimeout(acquireTimeoutRef.current);
      acquireTimeoutRef.current = null;
    }
    setAcquiring(false);
  }, []);

  const addGpsPoint = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    if (acquiring) {
      stopAcquire();
      toast.info("GPS acquisition cancelled", { id: "gps" });
      return;
    }

    setAcquiring(true);
    let best: GeolocationPosition | null = null;

    const acceptable = accuracyFilterEnabled ? accuracyThreshold : Infinity;
    const maxWaitMs = 20000; // give GPS up to 20s to converge

    toast.loading(
      accuracyFilterEnabled
        ? `Waiting for accuracy ≤ ${accuracyThreshold}m…`
        : "Getting GPS location…",
      { id: "gps" },
    );

    const finish = (reason: "ok" | "timeout") => {
      stopAcquire();
      if (!best) {
        toast.error("Could not get a GPS fix", { id: "gps" });
        return;
      }
      const { latitude, longitude, accuracy } = best.coords;
      if (reason === "timeout" && accuracyFilterEnabled && accuracy > acceptable) {
        toast.error(
          `Best fix was ±${accuracy.toFixed(0)}m — above your ${accuracyThreshold}m threshold. Point not added.`,
          { id: "gps" },
        );
        return;
      }
      setPoints((prev) => [...prev, { lat: latitude, lng: longitude }]);
      mapRef.current?.setView([latitude, longitude], 18);
      toast.success(`Point added (±${accuracy.toFixed(0)}m)`, { id: "gps" });
    };

    acquireWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLastAccuracy(pos.coords.accuracy);
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
        if (pos.coords.accuracy <= acceptable) finish("ok");
      },
      (err) => {
        stopAcquire();
        toast.error(`GPS error: ${err.message}`, { id: "gps" });
      },
      { enableHighAccuracy: true, timeout: maxWaitMs, maximumAge: 0 },
    );

    acquireTimeoutRef.current = window.setTimeout(() => finish("timeout"), maxWaitMs);
  }, [acquiring, accuracyFilterEnabled, accuracyThreshold, stopAcquire]);

  const toggleTracking = useCallback(() => {
    if (tracking) {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      liveMarkerRef.current?.remove();
      liveAccuracyRef.current?.remove();
      liveMarkerRef.current = null;
      liveAccuracyRef.current = null;
      setTracking(false);
      toast.info("Live tracking stopped");
      return;
    }
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapRef.current;
        if (!map) return;
        if (!liveMarkerRef.current) {
          liveMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "hsl(148 70% 40%)",
            fillColor: "hsl(148 70% 50%)",
            fillOpacity: 1,
            weight: 3,
          }).addTo(map);
          liveAccuracyRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "hsl(148 70% 40%)",
            fillColor: "hsl(148 70% 50%)",
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(map);
        } else {
          liveMarkerRef.current.setLatLng([latitude, longitude]);
          liveAccuracyRef.current?.setLatLng([latitude, longitude]);
          liveAccuracyRef.current?.setRadius(accuracy);
        }
      },
      (err) => toast.error(`Tracking error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );
    watchIdRef.current = id;
    setTracking(true);
    toast.success("Live GPS tracking on");
  }, [tracking]);

  const clearAll = useCallback(() => {
    setPoints([]);
    setAreaSqm(0);
    toast.info("All points cleared");
  }, []);

  const exportGeoJSON = useCallback(() => {
    if (points.length < 3) {
      toast.error("Need at least 3 points to export a field");
      return;
    }
    const coords = [...points, points[0]].map((p) => [p.lng, p.lat]);
    const fc = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "GeoFarm Field",
            area_sqm: areaSqm,
            area_hectares: areaSqm / SQM_PER_HECTARE,
            area_acres: areaSqm / SQM_PER_ACRE,
            created_at: new Date().toISOString(),
          },
          geometry: { type: "Polygon", coordinates: [coords] },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geofarm-field-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Field exported");
  }, [points, areaSqm]);

  const hectares = areaSqm / SQM_PER_HECTARE;
  const acres = areaSqm / SQM_PER_ACRE;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Floating action stack — desktop right, mobile bottom */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        {/* Top hint bar */}
        <div className="pointer-events-auto p-3 sm:p-4">
          <Card className="mx-auto max-w-xl border-border/60 bg-card/85 px-4 py-2.5 text-xs text-muted-foreground shadow-soft backdrop-blur sm:text-sm">
            <span className="font-medium text-foreground">Tip:</span> Tap the map to add corners, or
            walk your field and use <span className="font-semibold text-primary">Add GPS Point</span>.
            Right-click a marker to remove it. <a 
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 font-semibold text-primary underline hover:text-primary/80"
            >
              Weather Forecast →
            </a>
          </Card>
        </div>

        <div className="flex-1" />

        {/* Bottom panel */}
        <div className="pointer-events-auto p-3 sm:p-4">
          <Card className="mx-auto max-w-3xl overflow-hidden border-border/60 bg-card/95 shadow-elevated backdrop-blur">
            <div className="grid grid-cols-3 divide-x divide-border/60 bg-[image:var(--gradient-hero)] text-primary-foreground">
              <Stat label="Square meters" value={areaSqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} unit="m²" />
              <Stat label="Hectares" value={hectares.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit="ha" />
              <Stat label="Acres" value={acres.toLocaleString(undefined, { maximumFractionDigits: 4 })} unit="ac" />
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-6 sm:gap-2">
              <Button
                onClick={addGpsPoint}
                className="col-span-2 sm:col-span-2"
                size="lg"
                variant={acquiring ? "secondary" : "default"}
              >
                <Crosshair className={`size-4 ${acquiring ? "animate-pulse" : ""}`} />
                {acquiring
                  ? lastAccuracy != null
                    ? `±${lastAccuracy.toFixed(0)}m… tap to cancel`
                    : "Acquiring…"
                  : "Add GPS"}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="lg" aria-label="GPS settings">
                    <Settings2 className="size-4" />
                    <span className="sm:hidden">GPS</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
                  <div className="space-y-4">
                    <div>
                      <div className="font-display text-base font-semibold">GPS accuracy filter</div>
                      <p className="text-xs text-muted-foreground">
                        Only add a corner when the GPS fix is at least this precise.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="acc-toggle" className="text-sm">
                        Enable filter
                      </Label>
                      <Switch
                        id="acc-toggle"
                        checked={accuracyFilterEnabled}
                        onCheckedChange={setAccuracyFilterEnabled}
                      />
                    </div>

                    <div className={accuracyFilterEnabled ? "" : "opacity-50 pointer-events-none"}>
                      <div className="mb-2 flex items-baseline justify-between">
                        <Label className="text-sm">Max accuracy</Label>
                        <span className="font-display text-lg font-semibold text-primary">
                          ±{accuracyThreshold}m
                        </span>
                      </div>
                      <Slider
                        value={[accuracyThreshold]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(v) => setAccuracyThreshold(v[0])}
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                        <span>1m (survey)</span>
                        <span>10m (typical)</span>
                        <span>50m (loose)</span>
                      </div>
                    </div>

                    {lastAccuracy != null && (
                      <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Last reported accuracy:{" "}
                        <span className="font-semibold text-foreground">
                          ±{lastAccuracy.toFixed(1)}m
                        </span>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={toggleTracking}
                variant={tracking ? "default" : "secondary"}
                size="lg"
              >
                <Radio className={`size-4 ${tracking ? "animate-pulse" : ""}`} />
                {tracking ? "Tracking" : "Live"}
              </Button>
              <Button
                onClick={() => setEditMode((v) => !v)}
                variant={editMode ? "default" : "secondary"}
                size="lg"
              >
                <Pencil className="size-4" /> {editMode ? "Editing" : "Edit"}
              </Button>
              <Button onClick={exportGeoJSON} variant="secondary" size="lg">
                <Download className="size-4" /> Export
              </Button>
              <Button onClick={clearAll} variant="outline" size="lg">
                <Trash2 className="size-4" /> Clear
              </Button>
              <Button 
                onClick={() => window.open('http://localhost:5174', '_blank')} 
                variant="default" 
                size="lg"
              >
                <Cloud className="size-4" /> Weather
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> {points.length} point{points.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-3">
                {accuracyFilterEnabled && (
                  <span>
                    Filter: <span className="font-semibold text-foreground">±{accuracyThreshold}m</span>
                  </span>
                )}
                {editMode && <span className="text-accent-foreground">Drag markers to adjust</span>}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="px-3 py-3 text-center sm:py-4">
      <div className="text-[10px] uppercase tracking-wider opacity-80 sm:text-xs">{label}</div>
      <div className="mt-0.5 font-display text-xl font-semibold leading-tight sm:text-3xl">
        {value}
        <span className="ml-1 text-xs font-normal opacity-80 sm:text-sm">{unit}</span>
      </div>
    </div>
  );
}
