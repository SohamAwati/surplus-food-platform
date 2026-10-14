import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Users,
  Compass,
  Building,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Default PCCOE campus coordinates
const DEFAULT_ORIGIN = {
  lat: 18.6305,
  lng: 73.813,
  name: "PCCOE Campus / Rescue Dispatch",
};

// Calculate distance in KM using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate transit time in minutes (assumes ~22 km/h urban average in Pune)
function estimateTransitMinutes(distKm) {
  return Math.max(3, Math.round((distKm / 22) * 60));
}

export function NeedyZonesMap({
  zones = [],
  origin = DEFAULT_ORIGIN,
  activeTransaction = null,
  onSelectZone = null,
  className = "",
  compact = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const lineLayerRef = useRef(null);

  const [selectedZone, setSelectedZone] = useState(null);
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [now, setNow] = useState(new Date());

  // Update SLA clock every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Compute SLA minutes remaining for active transaction
  const slaRemainingMinutes = useMemo(() => {
    if (!activeTransaction?.slaDeadlineAt) return null;
    const deadline = new Date(activeTransaction.slaDeadlineAt);
    const diffMs = deadline.getTime() - now.getTime();
    return Math.round(diffMs / 60000);
  }, [activeTransaction, now]);

  // Origin point
  const currentOrigin = useMemo(() => {
    if (activeTransaction?.listing?.outlet) {
      const o = activeTransaction.listing.outlet;
      // PCCOE outlets coordinates or fallback
      const lat = o.name?.includes("Hostel") ? 18.631 : 18.6298;
      const lng = o.name?.includes("Hostel") ? 73.8145 : 73.8135;
      return { lat, lng, name: o.name || "Donor Outlet" };
    }
    return origin || DEFAULT_ORIGIN;
  }, [activeTransaction, origin]);

  // Enriched zones with distance, transit time, SLA feasibility
  const enrichedZones = useMemo(() => {
    return zones.map((z) => {
      const distKm = calculateDistanceKm(
        currentOrigin.lat,
        currentOrigin.lng,
        z.lat,
        z.lng
      );
      const transitMins = estimateTransitMinutes(distKm);

      let slaStatus = "ON_TRACK";
      let slaBuffer = null;

      if (slaRemainingMinutes !== null) {
        slaBuffer = slaRemainingMinutes - transitMins;
        if (slaRemainingMinutes <= 0) {
          slaStatus = "OVERDUE";
        } else if (slaBuffer < 0) {
          slaStatus = "AT_RISK";
        } else if (slaBuffer <= 10) {
          slaStatus = "TIGHT";
        } else {
          slaStatus = "ON_TRACK";
        }
      }

      return {
        ...z,
        distKm: Number(distKm.toFixed(1)),
        transitMins,
        slaStatus,
        slaBuffer,
      };
    }).sort((a, b) => {
      // Sort by priority desc, then distance asc
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.distKm - b.distKm;
    });
  }, [zones, currentOrigin, slaRemainingMinutes]);

  const filteredZones = useMemo(() => {
    if (filterPriority === "CRITICAL")
      return enrichedZones.filter((z) => z.priority >= 9);
    if (filterPriority === "HIGH")
      return enrichedZones.filter((z) => z.priority >= 7 && z.priority < 9);
    return enrichedZones;
  }, [enrichedZones, filterPriority]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [currentOrigin.lat, currentOrigin.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // CartoDB Positron clean map tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    lineLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers when zones or origin change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    lineLayerRef.current.clearLayers();

    // 1. Origin Marker (Outlet / Rescue Base)
    const originIcon = L.divIcon({
      className: "custom-origin-icon",
      html: `
        <div style="
          background: #0f172a;
          color: #10b981;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid #10b981;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    const originMarker = L.marker([currentOrigin.lat, currentOrigin.lng], {
      icon: originIcon,
      zIndexOffset: 1000,
    }).addTo(markersLayerRef.current);

    originMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <span style="font-size: 10px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">Rescue Origin / Outlet</span>
        <h4 style="margin: 2px 0 4px; font-size: 14px; font-weight: bold; color: #0f172a;">${currentOrigin.name}</h4>
        <p style="margin: 0; font-size: 11px; color: #64748b;">Starting point for food pickup & redistribution</p>
      </div>
    `);

    // 2. Needy Zones Markers & Radius Circles
    filteredZones.forEach((zone) => {
      const isSelected = selectedZone?.id === zone.id;
      const isEmergency = zone.priority >= 9;
      const isHigh = zone.priority >= 7 && zone.priority < 9;

      const primaryColor = isEmergency
        ? "#ef4444"
        : isHigh
        ? "#f59e0b"
        : "#3b82f6";

      // Radius circle
      L.circle([zone.lat, zone.lng], {
        radius: zone.radiusMeters || 3000,
        color: primaryColor,
        fillColor: primaryColor,
        fillOpacity: isSelected ? 0.18 : 0.08,
        weight: isSelected ? 2 : 1,
        dashArray: "4, 6",
      }).addTo(markersLayerRef.current);

      // Custom DivIcon for Needy Zone Pin
      const zoneIcon = L.divIcon({
        className: "custom-zone-icon",
        html: `
          <div style="
            position: relative;
            background: ${primaryColor};
            color: #ffffff;
            width: ${isSelected ? "40px" : "34px"};
            height: ${isSelected ? "40px" : "34px"};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px ${primaryColor}88;
            border: 3px solid #ffffff;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="font-size: 11px; font-weight: 800; letter-spacing: -0.02em;">P${zone.priority}</span>
            ${
              isEmergency
                ? `<div style="
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 2px solid ${primaryColor};
                    opacity: 0.7;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ""
            }
          </div>
        `,
        iconSize: [isSelected ? 40 : 34, isSelected ? 40 : 34],
        iconAnchor: [isSelected ? 20 : 17, isSelected ? 20 : 17],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: zoneIcon }).addTo(
        markersLayerRef.current
      );

      marker.on("click", () => {
        setSelectedZone(zone);
        if (onSelectZone) onSelectZone(zone);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; max-width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase;">
              Priority ${zone.priority}/10 ${isEmergency ? "• Critical" : ""}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #475569;">${zone.distKm} km away</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #0f172a;">${zone.name}</h4>
          <p style="margin: 0 0 8px; font-size: 12px; color: #475569; line-height: 1.4;">${zone.description || "Community food requirement"}</p>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: #0f172a; background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span>⏱️ ~${zone.transitMins}m transit</span>
            ${
              zone.slaStatus === "ON_TRACK"
                ? '<span style="color: #10b981;">✓ SLA Safe</span>'
                : zone.slaStatus === "AT_RISK"
                ? '<span style="color: #ef4444;">⚠️ SLA Risk</span>'
                : ""
            }
          </div>
        </div>
      `);
    });

    // 3. Connect origin to selected zone with a route polyline
    if (selectedZone) {
      const line = L.polyline(
        [
          [currentOrigin.lat, currentOrigin.lng],
          [selectedZone.lat, selectedZone.lng],
        ],
        {
          color: selectedZone.priority >= 9 ? "#ef4444" : "#10b981",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.85,
        }
      ).addTo(lineLayerRef.current);
    }
  }, [filteredZones, currentOrigin, selectedZone, onSelectZone]);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    if (onSelectZone) onSelectZone(zone);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], 14, {
        duration: 0.8,
      });
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Needy Zones & Delivery Route Radar
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <Sparkles size={11} /> Live Geospatial
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pinpoints demand clusters, orphanages & shelters within the SLA window
            </p>
          </div>
        </div>

        {/* SLA Status Widget if Active Transaction */}
        {activeTransaction && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
            <Clock size={16} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                SLA Delivery Window
              </p>
              <p className="font-bold text-white">
                {slaRemainingMinutes !== null
                  ? slaRemainingMinutes > 0
                    ? `${slaRemainingMinutes} mins remaining`
                    : "SLA Window Expired"
                  : "SLA Clock Active"}
              </p>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 rounded-xl bg-white/10 p-1 text-xs">
          {["ALL", "CRITICAL", "HIGH"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterPriority(f)}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filterPriority === f
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {f === "ALL"
                ? "All Zones"
                : f === "CRITICAL"
                ? "Emergency (P9-10)"
                : "High Need (P7-8)"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map + Side Zone Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Map Display */}
        <div className="relative lg:col-span-8 min-h-[400px]">
          <div
            ref={mapContainerRef}
            className="h-full w-full min-h-[400px] z-10"
          />

          {/* Map legend overlay */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 px-3.5 shadow-lg backdrop-blur-sm text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-900 border border-emerald-400"></span>
              <span>Pickup Outlet</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span>Critical (P9-10)</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span>High Need (P7-8)</span>
            </div>
          </div>
        </div>

        {/* Needy Zones List & SLA Guidance */}
        <div className="flex flex-col border-t border-slate-100 lg:border-t-0 lg:border-l lg:col-span-4 bg-slate-50/70 p-4 max-h-[520px] overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nearest Needy Zones ({filteredZones.length})
            </h4>
            <span className="text-[11px] text-slate-400">
              Sorted by urgency & distance
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {filteredZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isEmergency = zone.priority >= 9;

              return (
                <div
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className={`group cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isEmergency
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          P{zone.priority} Priority
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {zone.name}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {zone.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className={`shrink-0 transition ${
                        isSelected
                          ? "text-emerald-600 translate-x-0.5"
                          : "text-slate-300 group-hover:text-slate-500"
                      }`}
                    />
                  </div>

                  {/* Travel & SLA Feasibility pill */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px]">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="font-semibold text-slate-900">
                        📍 {zone.distKm} km
                      </span>
                      <span>⏱️ ~{zone.transitMins} mins bike/van</span>
                    </div>

                    {/* SLA buffer info */}
                    {slaRemainingMinutes !== null ? (
                      zone.slaBuffer !== null && zone.slaBuffer >= 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> +{zone.slaBuffer}m buffer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 font-bold text-red-700 border border-red-200">
                          <AlertTriangle size={11} /> High SLA risk
                        </span>
                      )
                    ) : (
                      <span className="text-emerald-600 font-semibold">
                        Ready for Delivery
                      </span>
                    )}
                  </div>

                  {/* Action row when selected */}
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${zone.lat},${zone.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Navigation size={13} />
                        Navigate in Google Maps
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
