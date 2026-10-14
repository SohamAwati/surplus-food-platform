import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  PackageCheck,
  AlertCircle,
  Utensils,
  CheckCircle2,
  Truck,
  Camera,
  Compass,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

import {
  getMyTransactions,
  confirmPickup,
  confirmDelivery,
} from "./transaction.api";
import { getNeedZones } from "../need-zones/need-zone.api";

import { Button } from "../../components/ui/Button";
import { TransactionCard } from "../../components/transactions/TransactionCard";
import { SubmitProofModal } from "../../components/transactions/SubmitProofModal";
import { NeedyZonesMap } from "../../components/map/NeedyZonesMap";
import { useAuthStore } from "../../store/auth.store";

export function MyTransactionsView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "NGO";
  const listingsPath =
    role === "VOLUNTEER" ? "/volunteer/listings" : "/ngo/listings";

  const [transactions, setTransactions] = useState([]);
  const [needyZones, setNeedyZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [proofModalTransaction, setProofModalTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [viewMode, setViewMode] = useState("LIST"); // 'LIST' | 'MAP'
  const [activeMapTransaction, setActiveMapTransaction] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [txRes, zonesRes] = await Promise.allSettled([
        getMyTransactions(),
        getNeedZones(),
      ]);

      if (txRes.status === "fulfilled") {
        setTransactions(txRes.value?.data || []);
      } else {
        setError(txRes.reason?.message || "Unable to load transactions.");
      }

      if (zonesRes.status === "fulfilled") {
        setNeedyZones(zonesRes.value || []);
      }
    } catch (err) {
      setError(err?.message || "Unable to load transactions and map data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePickup(transactionId) {
    setActionLoading(transactionId);
    setError("");
    setSuccessMessage("");

    try {
      await confirmPickup(transactionId);
      setSuccessMessage(
        "Pickup confirmed successfully! Proceed to delivery location."
      );
      await loadData();
    } catch (err) {
      setError(err?.message || "Unable to confirm pickup.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelivery(transactionId) {
    setActionLoading(transactionId);
    setError("");
    setSuccessMessage("");

    try {
      await confirmDelivery(transactionId);
      setSuccessMessage(
        "Delivery confirmed! Please upload proof of distribution to finalize verification."
      );
      await loadData();
    } catch (err) {
      setError(err?.message || "Unable to confirm delivery.");
    } finally {
      setActionLoading(null);
    }
  }

  const activeCount = transactions.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const deliveredCount = transactions.filter(
    (item) => item.status === "DELIVERED"
  ).length;

  const closedCount = transactions.filter(
    (item) => item.status === "CLOSED"
  ).length;

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return transactions;
    if (activeTab === "ACTIVE")
      return transactions.filter((t) => t.status === "ACTIVE");
    if (activeTab === "DELIVERED")
      return transactions.filter((t) => t.status === "DELIVERED");
    if (activeTab === "CLOSED")
      return transactions.filter((t) => t.status === "CLOSED");
    return transactions;
  }, [transactions, activeTab]);

  const handleOpenMapForTransaction = (t) => {
    setActiveMapTransaction(t);
    setViewMode("MAP");
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-emerald-600">
              Food Rescue Lifecycle
            </p>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              SLA Delivery Engine
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Rescue Transactions & Deliveries
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track claimed food from pickup through distribution proof, with live needy zones radar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View mode switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition ${
                viewMode === "LIST"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PackageCheck size={14} />
              Rescues List
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMapTransaction(null);
                setViewMode("MAP");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition ${
                viewMode === "MAP"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass size={14} />
              Needy Zones Map
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-300">
                Live
              </span>
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button onClick={() => navigate(listingsPath)}>
            <Utensils className="h-4 w-4" />
            Find More Food
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("ALL")}
          className={`cursor-pointer rounded-2xl border p-5 transition ${
            activeTab === "ALL"
              ? "border-slate-900 bg-slate-900 text-white shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              activeTab === "ALL" ? "text-slate-400" : "text-slate-400"
            }`}
          >
            Total Rescues
          </p>
          <p className="mt-2 text-2xl font-bold">{transactions.length}</p>
        </div>

        <div
          onClick={() => setActiveTab("ACTIVE")}
          className={`cursor-pointer rounded-2xl border p-5 transition ${
            activeTab === "ACTIVE"
              ? "border-blue-600 bg-blue-50/70 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            In Transit / Active
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("DELIVERED")}
          className={`cursor-pointer rounded-2xl border p-5 transition ${
            activeTab === "DELIVERED"
              ? "border-amber-600 bg-amber-50/70 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Delivered / Handover
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {deliveredCount}
          </p>
        </div>

        <div
          onClick={() => setActiveTab("CLOSED")}
          className={`cursor-pointer rounded-2xl border p-5 transition ${
            activeTab === "CLOSED"
              ? "border-emerald-600 bg-emerald-50/70 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Verified & Closed
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {closedCount}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === "MAP" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Needy Zones Radar & SLA Delivery Navigator
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("LIST")}
              className="text-xs bg-white"
            >
              Switch back to Rescues List
            </Button>
          </div>

          <NeedyZonesMap
            zones={needyZones}
            activeTransaction={
              activeMapTransaction ||
              filteredTransactions.find(
                (t) => t.status === "ACTIVE" || t.status === "DELIVERED"
              )
            }
          />
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "LIST" && (
        <>
          {/* Quick Radar Map Banner */}
          {needyZones.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    {needyZones.length} High-Need Distribution Zones Active Nearby
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Locate homeless shelters, orphanages, and community kitchens within your SLA transit window.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("MAP")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <MapPin size={13} />
                Open Needy Zones Map
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTransactions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <PackageCheck className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No transactions found
              </h2>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                {activeTab !== "ALL"
                  ? `You don't have any rescue transactions in the "${activeTab}" state.`
                  : "Claim an available food listing to start a rescue mission."}
              </p>
              <Button
                onClick={() => navigate(listingsPath)}
                className="mt-6"
              >
                <Utensils className="h-4 w-4" />
                Browse Available Food
              </Button>
            </div>
          )}

          {/* Transactions List */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="space-y-5">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onPickup={handlePickup}
                  onDelivery={handleDelivery}
                  onSubmitProof={(t) => setProofModalTransaction(t)}
                  onViewMap={handleOpenMapForTransaction}
                  actionLoading={actionLoading === transaction.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Submit Proof Modal */}
      {proofModalTransaction && (
        <SubmitProofModal
          transaction={proofModalTransaction}
          onClose={() => setProofModalTransaction(null)}
          onSuccess={() => {
            setProofModalTransaction(null);
            setSuccessMessage(
              "Proof submitted successfully! It is now pending donor review."
            );
            loadData();
          }}
        />
      )}
    </div>
  );
}