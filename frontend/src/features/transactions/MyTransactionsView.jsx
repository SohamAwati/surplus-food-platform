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
} from "lucide-react";

import {
  getMyTransactions,
  confirmPickup,
  confirmDelivery,
} from "./transaction.api";

import { Button } from "../../components/ui/Button";
import { TransactionCard } from "../../components/transactions/TransactionCard";
import { SubmitProofModal } from "../../components/transactions/SubmitProofModal";
import { useAuthStore } from "../../store/auth.store";

export function MyTransactionsView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "NGO";
  const listingsPath =
    role === "VOLUNTEER" ? "/volunteer/listings" : "/ngo/listings";

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [proofModalTransaction, setProofModalTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyTransactions();
      setTransactions(response?.data || []);
    } catch (err) {
      setError(
        err?.message || "Unable to load transactions."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handlePickup(transactionId) {
    setActionLoading(transactionId);
    setError("");
    setSuccessMessage("");

    try {
      await confirmPickup(transactionId);
      setSuccessMessage("Pickup confirmed successfully! Proceed to delivery location.");
      await loadTransactions();
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
      setSuccessMessage("Delivery confirmed! Please upload proof of distribution to finalize verification.");
      await loadTransactions();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Food Rescue Lifecycle
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Rescue Transactions & Deliveries
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track claimed food from pickup confirmation through distribution proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={loadTransactions}
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
          <p className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "ALL" ? "text-slate-400" : "text-slate-400"}`}>
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
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {activeCount}
          </p>
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
            Delivered / Proof Pending
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
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
          <p className="mt-3 text-sm text-slate-500">
            Loading your transactions...
          </p>
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
              actionLoading={actionLoading === transaction.id}
            />
          ))}
        </div>
      )}

      {/* Submit Proof Modal */}
      {proofModalTransaction && (
        <SubmitProofModal
          transaction={proofModalTransaction}
          onClose={() => setProofModalTransaction(null)}
          onSuccess={() => {
            setProofModalTransaction(null);
            setSuccessMessage("Proof submitted successfully! It is now pending donor review.");
            loadTransactions();
          }}
        />
      )}
    </div>
  );
}