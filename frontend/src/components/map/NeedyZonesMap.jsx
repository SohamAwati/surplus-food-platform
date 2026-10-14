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
  Store,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Route,
  ArrowRight,
} from "lucide-react";
import { getActiveOutlets, getNeedZones } from "../../features/need-zones/need-zone.api";

// Default PCCOE campus coordinates
const DEFAULT_ORIGIN = {
  lat: 18.6305,
  lng: 73.813,
  name: "PCCOE Campus / Rescue Dispatch",
};

// Calculate distance in KM using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999999;
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
  return Math.max(2, Math.round((distKm / 22) * 60));
}

export function NeedyZonesMap({
  zones: propZones = null,
  outlets: propOutlets = null,
  origin = DEFAULT_ORIGIN,
  activeTransaction = null,
  onSelectZone = null,
  onSelectOutlet = null,
  className = "",
  compact = false,
  title = "Geospatial Radar: Outlets & Needy Zones",
  subtitle = "Proximity intelligence linking donor food outlets with community needy zones",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const lineLayerRef = useRef(null);

  const [internalZones, setInternalZones] = useState([]);
  const [internalOutlets, setInternalOutlets] = useState([]);
  const [activeTab, setActiveTab] = useState("ZONES"); // "ZONES" | "OUTLETS"
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'ZONE'|'OUTLET', data: ... }
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // "ALL" | "CRITICAL" | "HIGH" | "OUTLETS"
  const [now, setNow] = useState(new Date());

  // Fetch zones and outlets if not supplied via props
  useEffect(() => {
    let isMounted = true;

    if (!propZones) {
      getNeedZones()
        .then((data) => {
          if (isMounted) setInternalZones(data || []);
        })
        .catch((err) => console.warn("Failed to load need zones in map:", err));
    }

    if (!propOutlets || propOutlets.length === 0) {
      getActiveOutlets()
        .then((data) => {
          if (isMounted) setInternalOutlets(data || []);
        })
        .catch((err) => console.warn("Failed to load active outlets in map:", err));
    }

    return () => {
      isMounted = false;
    };
  }, [propZones, propOutlets]);

  const rawZones = propZones || internalZones;
  const rawOutlets = (propOutlets && propOutlets.length > 0) ? propOutlets : internalOutlets;

  // Normalize Outlets with lat/lng
  const normalizedOutlets = useMemo(() => {
    return (rawOutlets || []).map((o) => {
      const lat = o.lat ?? o.latitude;
      const lng = o.lng ?? o.longitude;
      return {
        ...o,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
      };
    }).filter((o) => o.lat != null && o.lng != null);
  }, [rawOutlets]);

  // Normalize Zones with lat/lng
  const normalizedZones = useMemo(() => {
    return (rawZones || []).map((z) => {
      const lat = z.lat ?? z.latitude;
      const lng = z.lng ?? z.longitude;
      return {
        ...z,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
      };
    }).filter((z) => z.lat != null && z.lng != null);
  }, [rawZones]);

  // Compute SLA minutes remaining for active transaction
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

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
      const lat = o.lat ?? o.latitude ?? (o.name?.includes("Hostel") ? 18.631 : 18.6298);
      const lng = o.lng ?? o.longitude ?? (o.name?.includes("Hostel") ? 73.8145 : 73.8135);
      return { lat: Number(lat), lng: Number(lng), name: o.name || "Donor Outlet" };
    }
    if (normalizedOutlets.length > 0) {
      return {
        lat: normalizedOutlets[0].lat,
        lng: normalizedOutlets[0].lng,
        name: normalizedOutlets[0].name || "Primary Outlet",
      };
    }
    return origin || DEFAULT_ORIGIN;
  }, [activeTransaction, normalizedOutlets, origin]);

  // Pair each Needy Zone with its Nearest Donor Outlet
  const enrichedZones = useMemo(() => {
    return normalizedZones.map((zone) => {
      // Find closest outlet
      let nearestOutlet = null;
      let minOutletDist = Infinity;

      normalizedOutlets.forEach((outlet) => {
        const d = calculateDistanceKm(zone.lat, zone.lng, outlet.lat, outlet.lng);
        if (d < minOutletDist) {
          minOutletDist = d;
          nearestOutlet = {
            ...outlet,
            distKm: Number(d.toFixed(2)),
            transitMins: estimateTransitMinutes(d),
          };
        }
      });

      // Distance from current origin
      const distFromOriginKm = calculateDistanceKm(
        currentOrigin.lat,
        currentOrigin.lng,
        zone.lat,
        zone.lng
      );
      const transitFromOriginMins = estimateTransitMinutes(distFromOriginKm);

      let slaStatus = "ON_TRACK";
      let slaBuffer = null;

      if (slaRemainingMinutes !== null) {
        slaBuffer = slaRemainingMinutes - transitFromOriginMins;
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
        ...zone,
        nearestOutlet,
        distFromOriginKm: Number(distFromOriginKm.toFixed(1)),
        transitFromOriginMins,
        slaStatus,
        slaBuffer,
      };
    }).sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const distA = a.nearestOutlet?.distKm ?? a.distFromOriginKm;
      const distB = b.nearestOutlet?.distKm ?? b.distFromOriginKm;
      return distA - distB;
    });
  }, [normalizedZones, normalizedOutlets, currentOrigin, slaRemainingMinutes]);

  // Pair each Outlet with its Nearest Needy Zone
  const enrichedOutlets = useMemo(() => {
    return normalizedOutlets.map((outlet) => {
      let nearestZone = null;
      let minZoneDist = Infinity;

      normalizedZones.forEach((zone) => {
        const d = calculateDistanceKm(outlet.lat, outlet.lng, zone.lat, zone.lng);
        if (d < minZoneDist) {
          minZoneDist = d;
          nearestZone = {
            ...zone,
            distKm: Number(d.toFixed(2)),
            transitMins: estimateTransitMinutes(d),
          };
        }
      });

      const zonesIn5Km = normalizedZones.filter((z) => {
        return calculateDistanceKm(outlet.lat, outlet.lng, z.lat, z.lng) <= 5.0;
      }).length;

      return {
        ...outlet,
        nearestZone,
        zonesIn5Km,
      };
    });
  }, [normalizedOutlets, normalizedZones]);

  // Filtered lists
  const filteredZones = useMemo(() => {
    return enrichedZones.filter((z) => {
      if (filterType === "CRITICAL" && z.priority < 9) return false;
      if (filterType === "HIGH" && (z.priority < 7 || z.priority >= 9)) return false;
      if (filterType === "OUTLETS") return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        z.name?.toLowerCase().includes(q) ||
        z.description?.toLowerCase().includes(q) ||
        z.nearestOutlet?.name?.toLowerCase().includes(q)
      );
    });
  }, [enrichedZones, filterType, searchQuery]);

  const filteredOutlets = useMemo(() => {
    if (filterType === "CRITICAL" || filterType === "HIGH") return [];
    return enrichedOutlets.filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.name?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.donorName?.toLowerCase().includes(q)
      );
    });
  }, [enrichedOutlets, filterType, searchQuery]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = currentOrigin.lat || 18.6305;
    const initialLng = currentOrigin.lng || 73.813;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    lineLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Connections
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    lineLayerRef.current.clearLayers();

    // 1. Plot Outlets
    filteredOutlets.forEach((outlet) => {
      const isSelected = selectedItem?.type === "OUTLET" && selectedItem?.data?.id === outlet.id;

      const outletIcon = L.divIcon({
        className: "custom-outlet-marker",
        html: `
          <div style="
            position: relative;
            background: #064e3b;
            color: #34d399;
            width: ${isSelected ? "44px" : "38px"};
            height: ${isSelected ? "44px" : "38px"};
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4);
            border: 2px solid ${isSelected ? "#10b981" : "#059669"};
            cursor: pointer;
            transition: all 0.25s ease;
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
              <path d="M2 7h20"></path>
              <circle cx="12" cy="7" r="1"></circle>
            </svg>
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    inset: -5px;
                    border-radius: 18px;
                    border: 2px dashed #10b981;
                    animation: spin 8s linear infinite;
                  "></div>`
                : ""
            }
          </div>
        `,
        iconSize: [isSelected ? 44 : 38, isSelected ? 44 : 38],
        iconAnchor: [isSelected ? 22 : 19, isSelected ? 22 : 19],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([outlet.lat, outlet.lng], {
        icon: outletIcon,
        zIndexOffset: isSelected ? 1200 : 900,
      }).addTo(markersLayerRef.current);

      marker.on("click", () => {
        setSelectedItem({ type: "OUTLET", data: outlet });
        setActiveTab("OUTLETS");
        if (onSelectOutlet) onSelectOutlet(outlet);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 230px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0; text-transform: uppercase;">
              Donor Outlet
            </span>
            ${outlet.donorName ? `<span style="font-size: 11px; font-weight: 600; color: #64748b;">${outlet.donorName}</span>` : ""}
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">${outlet.name}</h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #475569;">📍 ${outlet.address || "Local branch"}</p>
          
          ${
            outlet.nearestZone
              ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; font-size: 11px; color: #0f172a;">
                <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #059669; margin-bottom: 2px;">
                  Nearest Needy Zone:
                </div>
                <div style="font-weight: 600;">${outlet.nearestZone.name} (Priority ${outlet.nearestZone.priority})</div>
                <div style="color: #64748b; font-size: 10px; margin-top: 2px;">
                  ⚡ <strong>${outlet.nearestZone.distKm} km away</strong> (~${outlet.nearestZone.transitMins} min transit)
                </div>
              </div>
            `
              : ""
          }
        </div>
      `);
    });

    // 2. Plot Needy Zones
    filteredZones.forEach((zone) => {
      const isSelected = selectedItem?.type === "ZONE" && selectedItem?.data?.id === zone.id;
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
        fillOpacity: isSelected ? 0.2 : 0.08,
        weight: isSelected ? 2.5 : 1,
        dashArray: "4, 6",
      }).addTo(markersLayerRef.current);

      const zoneIcon = L.divIcon({
        className: "custom-zone-marker",
        html: `
          <div style="
            position: relative;
            background: ${primaryColor};
            color: #ffffff;
            width: ${isSelected ? "42px" : "34px"};
            height: ${isSelected ? "42px" : "34px"};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px ${primaryColor}77;
            border: 3px solid #ffffff;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="font-size: 11px; font-weight: 800; letter-spacing: -0.02em;">P${zone.priority}</span>
            ${
              isEmergency
                ? `<div style="
                    position: absolute;
                    inset: -5px;
                    border-radius: 50%;
                    border: 2px solid ${primaryColor};
                    opacity: 0.8;
                    animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ""
            }
          </div>
        `,
        iconSize: [isSelected ? 42 : 34, isSelected ? 42 : 34],
        iconAnchor: [isSelected ? 21 : 17, isSelected ? 21 : 17],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([zone.lat, zone.lng], {
        icon: zoneIcon,
        zIndexOffset: isSelected ? 1100 : 800,
      }).addTo(markersLayerRef.current);

      marker.on("click", () => {
        setSelectedItem({ type: "ZONE", data: zone });
        setActiveTab("ZONES");
        if (onSelectZone) onSelectZone(zone);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 240px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase;">
              Priority ${zone.priority}/10 ${isEmergency ? "• Emergency" : ""}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">${zone.name}</h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #475569; line-height: 1.4;">${zone.description || "Needy community cluster"}</p>
          
          ${
            zone.nearestOutlet
              ? `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 6px 8px; font-size: 11px; color: #064e3b; margin-bottom: 6px;">
                <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #047857;">
                  🏪 Nearest Donor Outlet:
                </div>
                <div style="font-weight: 700; margin-top: 2px;">${zone.nearestOutlet.name}</div>
                <div style="color: #065f46; font-size: 11px; margin-top: 2px;">
                  📍 <strong>${zone.nearestOutlet.distKm} km</strong> &nbsp;|&nbsp; ⏱️ ~${zone.nearestOutlet.transitMins} min transit
                </div>
              </div>
            `
              : ""
          }
        </div>
      `);
    });

    // 3. Draw Connecting Link Line
    if (selectedItem?.type === "ZONE" && selectedItem.data.nearestOutlet) {
      const z = selectedItem.data;
      const o = z.nearestOutlet;
      L.polyline(
        [
          [o.lat, o.lng],
          [z.lat, z.lng],
        ],
        {
          color: z.priority >= 9 ? "#ef4444" : "#10b981",
          weight: 4,
          dashArray: "6, 8",
          opacity: 0.9,
        }
      ).addTo(lineLayerRef.current);
    } else if (selectedItem?.type === "OUTLET" && selectedItem.data.nearestZone) {
      const o = selectedItem.data;
      const z = o.nearestZone;
      L.polyline(
        [
          [o.lat, o.lng],
          [z.lat, z.lng],
        ],
        {
          color: "#10b981",
          weight: 4,
          dashArray: "6, 8",
          opacity: 0.9,
        }
      ).addTo(lineLayerRef.current);
    }
  }, [filteredZones, filteredOutlets, selectedItem, onSelectZone, onSelectOutlet]);

  // Center / FlyTo
  const handleItemClick = (type, item) => {
    setSelectedItem({ type, data: item });
    if (type === "ZONE" && onSelectZone) onSelectZone(item);
    if (type === "OUTLET" && onSelectOutlet) onSelectOutlet(item);

    if (mapInstanceRef.current && item.lat != null && item.lng != null) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 14, {
        duration: 0.8,
      });
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {title}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <Sparkles size={11} /> Two-Way Radar
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {subtitle}
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
          {[
            { id: "ALL", label: "All Items" },
            { id: "CRITICAL", label: "Emergency Zones" },
            { id: "OUTLETS", label: "Outlets Only" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilterType(f.id);
                if (f.id === "OUTLETS") setActiveTab("OUTLETS");
                else if (f.id === "CRITICAL") setActiveTab("ZONES");
              }}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filterType === f.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map + Side Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Map Display */}
        <div className="relative lg:col-span-8 min-h-[420px]">
          <div
            ref={mapContainerRef}
            className="h-full w-full min-h-[420px] z-10"
          />

          {/* Map legend overlay */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 px-3.5 shadow-lg backdrop-blur-sm text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-md bg-[#064e3b] text-[#34d399] border border-emerald-400 text-[9px] font-bold">
                🏪
              </span>
              <span>Donor Outlet ({normalizedOutlets.length})</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span>Emergency Zone (P9-10)</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span>High Priority Zone (P7-8)</span>
            </div>
          </div>
        </div>

        {/* Side Intelligence Panel */}
        <div className="flex flex-col border-t border-slate-100 lg:border-t-0 lg:border-l lg:col-span-4 bg-slate-50/70 p-4 max-h-[560px] overflow-hidden">
          {/* Panel Tabs */}
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-200/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ZONES")}
              className={`flex-1 rounded-lg py-1.5 text-center transition ${
                activeTab === "ZONES"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Needy Zones ({enrichedZones.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("OUTLETS")}
              className={`flex-1 rounded-lg py-1.5 text-center transition ${
                activeTab === "OUTLETS"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Donor Outlets ({enrichedOutlets.length})
            </button>
          </div>

          {/* Search bar inside panel */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={`Search ${activeTab === "ZONES" ? "needy zones" : "outlets"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Tab 1: Needy Zones List */}
          {activeTab === "ZONES" && (
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {filteredZones.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching needy zones found.
                </div>
              ) : (
                filteredZones.map((zone) => {
                  const isSelected =
                    selectedItem?.type === "ZONE" &&
                    selectedItem?.data?.id === zone.id;
                  const isEmergency = zone.priority >= 9;

                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleItemClick("ZONE", zone)}
                      className={`group cursor-pointer rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                isEmergency
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              P{zone.priority}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {zone.name}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            {zone.description || "Community food requirement"}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`shrink-0 transition ${
                            isSelected
                              ? "text-emerald-600 translate-x-0.5"
                              : "text-slate-300 group-hover:text-slate-500"
                          }`}
                        />
                      </div>

                      {/* Nearest Donor Outlet Linkage */}
                      {zone.nearestOutlet && (
                        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-emerald-50/70 p-2 text-[11px] border border-emerald-100">
                          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold truncate">
                            <Store size={13} className="text-emerald-600 shrink-0" />
                            <span className="truncate">
                              Nearest: {zone.nearestOutlet.name}
                            </span>
                          </div>
                          <span className="shrink-0 font-bold text-emerald-700">
                            {zone.nearestOutlet.distKm} km (~{zone.nearestOutlet.transitMins}m)
                          </span>
                        </div>
                      )}

                      {/* Action when selected */}
                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                          {zone.nearestOutlet ? (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${zone.nearestOutlet.lat},${zone.nearestOutlet.lng}&destination=${zone.lat},${zone.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                            >
                              <Navigation size={13} />
                              <span>Route from Outlet</span>
                              <ExternalLink size={11} className="opacity-80" />
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${zone.lat},${zone.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                            >
                              <Navigation size={13} />
                              <span>Directions</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Donor Outlets List */}
          {activeTab === "OUTLETS" && (
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {filteredOutlets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No donor outlets found.
                </div>
              ) : (
                filteredOutlets.map((outlet) => {
                  const isSelected =
                    selectedItem?.type === "OUTLET" &&
                    selectedItem?.data?.id === outlet.id;

                  return (
                    <div
                      key={outlet.id}
                      onClick={() => handleItemClick("OUTLET", outlet)}
                      className={`group cursor-pointer rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              🏪
                            </span>
                            <span className="truncate text-xs font-bold text-slate-900">
                              {outlet.name}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500 truncate">
                            📍 {outlet.address || "Local branch"}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`shrink-0 transition ${
                            isSelected
                              ? "text-emerald-600 translate-x-0.5"
                              : "text-slate-300 group-hover:text-slate-500"
                          }`}
                        />
                      </div>

                      {/* Nearest Needy Zone Linkage */}
                      {outlet.nearestZone ? (
                        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2 text-[11px] border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold truncate">
                            <Compass size={13} className="text-amber-500 shrink-0" />
                            <span className="truncate">
                              Closest Need: {outlet.nearestZone.name}
                            </span>
                          </div>
                          <span className="shrink-0 font-bold text-slate-700">
                            {outlet.nearestZone.distKm} km (~{outlet.nearestZone.transitMins}m)
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] text-slate-400">
                          No nearby needy zones mapped yet
                        </div>
                      )}

                      {/* Action when selected */}
                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                          {outlet.nearestZone && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${outlet.lat},${outlet.lng}&destination=${outlet.nearestZone.lat},${outlet.nearestZone.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                            >
                              <Route size={13} />
                              <span>Route to Needy Zone</span>
                              <ExternalLink size={11} className="opacity-80" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
