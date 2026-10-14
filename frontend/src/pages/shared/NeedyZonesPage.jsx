import { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  RefreshCw,
  Plus,
  Loader2,
  Users,
  Clock,
  ShieldAlert,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { NeedyZonesMap } from "../../components/map/NeedyZonesMap";
import { getNeedZones, createNeedZone, getActiveOutlets } from "../../features/need-zones/need-zone.api";
import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";

export function NeedyZonesPage() {
  const user = useAuthStore((state) => state.user);
  const isNGO = user?.role === "NGO" || user?.role === "ADMIN";

  const [zones, setZones] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Zone Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: 8,
    radiusMeters: 3000,
    lat: 18.6305,
    lng: 73.813,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [zonesData, outletsData] = await Promise.allSettled([
        getNeedZones(),
        getActiveOutlets(),
      ]);
      if (zonesData.status === "fulfilled") {
        setZones(zonesData.value || []);
      }
      if (outletsData.status === "fulfilled") {
        setOutlets(outletsData.value || []);
      }
    } catch (err) {
      setError(err?.message || "Failed to load needy zones and outlets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setError("");
    setSubmitSuccess("");

    try {
      await createNeedZone({
        name: formData.name.trim(),
        description: formData.description.trim(),
        priority: Number(formData.priority),
        radiusMeters: Number(formData.radiusMeters),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      });

      setSubmitSuccess("Needy zone registered successfully on the geospatial radar!");
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        priority: 8,
        radiusMeters: 3000,
        lat: 18.6305,
        lng: 73.813,
      });
      await loadData();
    } catch (err) {
      setError(err?.message || "Failed to register needy zone.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredZones = zones.filter((z) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      z.name?.toLowerCase().includes(q) ||
      z.description?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Needy Zones Radar">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-600">
                Geospatial Food Rescue
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                SLA Optimized
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Needy Zones & Demand Map
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Identify underserved communities, shelter homes, and orphanages to deliver rescued food within SLA deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              loading={loading}
              className="bg-white"
            >
              <RefreshCw size={15} />
              Refresh Radar
            </Button>

            {isNGO && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <Plus size={16} />
                Register Needy Zone
              </Button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {submitSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <ShieldAlert size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Geospatial Map */}
        <NeedyZonesMap
          zones={filteredZones}
          outlets={outlets}
          title="Needy Zones & Nearest Outlets Radar"
          subtitle="Identify community need clusters paired with closest donor food outlets for SLA compliance"
        />

        {/* Add Zone Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <MapPin size={20} className="text-emerald-400" />
                  <h3 className="font-bold text-base">Register New Needy Zone</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateZone} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinchwad Slum Relief Shelter"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description & Beneficiary Need
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Night shelter supporting 80+ daily wage workers and children."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Urgency Priority (1 - 10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Coverage Radius (Meters)
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={formData.radiusMeters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          radiusMeters: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formData.lat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lat: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formData.lng}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lng: parseFloat(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Register Zone
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
