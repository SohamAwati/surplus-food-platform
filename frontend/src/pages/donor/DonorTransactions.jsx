import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  ShieldCheck,
  Truck,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { getDonorTransactions, acknowledgeProof } from "../../features/transactions/transaction.api";
import { Button } from "../../components/ui/Button";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DonorTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDonorTransactions();
      setTransactions(response?.data || []);
    } catch (err) {
      setError(err?.message || "Unable to load donor transactions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAcknowledge = async (transactionId) => {
    setActionLoading(transactionId);
    setError("");
    setSuccessMessage("");

    try {
      await acknowledgeProof(transactionId);
      setSuccessMessage(
        "Proof of distribution acknowledged successfully! Reward points awarded and donation closed."
      );
      await loadTransactions();
    } catch (err) {
      setError(err?.message || "Failed to acknowledge proof.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingVerificationCount = transactions.filter(
    (t) => t.status === "DELIVERED" && t.proof
  ).length;

  const inProgressCount = transactions.filter(
    (t) => t.status === "ACTIVE"
  ).length;

  const closedCount = transactions.filter(
    (t) => t.status === "CLOSED"
  ).length;

  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return transactions;
    if (activeTab === "PENDING_PROOF")
      return transactions.filter((t) => t.status === "DELIVERED" && t.proof);
    if (activeTab === "ACTIVE")
      return transactions.filter((t) => t.status === "ACTIVE");
    if (activeTab === "CLOSED")
      return transactions.filter((t) => t.status === "CLOSED");
    return transactions;
  }, [transactions, activeTab]);

  return (
    <DashboardLayout title="Claims & Deliveries">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Donor Rescue Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Claims, Deliveries & Proofs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor food claimed by rescue organizations, inspect proof photos, and acknowledge completions.
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

            <Link to="/donor/listings/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Tab Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div
            onClick={() => setActiveTab("ALL")}
            className={`cursor-pointer rounded-2xl border p-5 transition ${
              activeTab === "ALL"
                ? "border-slate-900 bg-slate-900 text-white shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Transactions
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
              In Progress / Pickup
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {inProgressCount}
            </p>
          </div>

          <div
            onClick={() => setActiveTab("PENDING_PROOF")}
            className={`cursor-pointer rounded-2xl border p-5 transition ${
              activeTab === "PENDING_PROOF"
                ? "border-amber-600 bg-amber-50/70 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Needs Verification (Proof Ready)
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {pendingVerificationCount}
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
              Loading donation transactions...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTransactions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No transactions in this category
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {activeTab === "PENDING_PROOF"
                ? "No proofs waiting for your acknowledgment right now."
                : "When an organization claims your food listing, the rescue transaction will appear here."}
            </p>
            <Link to="/donor/listings/new">
              <Button className="mt-6">
                <Plus className="h-4 w-4" />
                Post Food Listing
              </Button>
            </Link>
          </div>
        )}

        {/* Transactions Cards */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="space-y-5">
            {filteredTransactions.map((tx) => {
              const listing = tx.listing;
              const claim = tx.claim;
              const claimant = claim?.claimant;
              const claimantProfile =
                claimant?.ngoProfile || claimant?.volunteerProfile;
              const claimantName =
                claimantProfile?.organizationName ||
                claimantProfile?.fullName ||
                claimant?.name ||
                claimant?.email ||
                "Rescue Partner";

              const proof = tx.proof;

              return (
                <div
                  key={tx.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {listing?.title || "Food Listing"}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              tx.status === "CLOSED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : tx.status === "DELIVERED"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Claimed by{" "}
                          <strong className="text-slate-800">
                            {claimantName}
                          </strong>{" "}
                          • Outlet: {listing?.outlet?.name || "Main Outlet"}
                        </p>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        <p>ID: {tx.id.slice(0, 8)}</p>
                        <p className="mt-0.5">
                          Started: {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="grid gap-4 p-6 sm:grid-cols-3 bg-slate-50/40">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Quantity
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {listing?.quantity} {listing?.unit || "units"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Pickup Status
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {tx.pickupAt ? (
                          <span className="text-emerald-700 font-medium">
                            ✓ Collected on {formatDate(tx.pickupAt)}
                          </span>
                        ) : (
                          <span className="text-amber-700">
                            Awaiting collection
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Delivery Status
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {tx.deliveredAt ? (
                          <span className="text-emerald-700 font-medium">
                            ✓ Delivered on {formatDate(tx.deliveredAt)}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            In transit
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Proof Section */}
                  {proof && (
                    <div className="border-t border-slate-100 bg-white p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                          {proof.imageUrl ? (
                            <a
                              href={proof.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
                            >
                              <img
                                src={proof.imageUrl}
                                alt="Proof of delivery"
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition text-white">
                                <ExternalLink size={16} />
                              </div>
                            </a>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <ImageIcon size={28} />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                Proof of Distribution
                              </span>
                              <span className="text-xs text-slate-400">
                                Uploaded {formatDate(proof.createdAt)}
                              </span>
                            </div>

                            {proof.notes && (
                              <p className="mt-1 text-sm text-slate-700">
                                "{proof.notes}"
                              </p>
                            )}

                            {proof.beneficiaryCount && (
                              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <Users size={14} />
                                {proof.beneficiaryCount} people served
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Acknowledge Button */}
                        {tx.status === "DELIVERED" && (
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Button
                              onClick={() => handleAcknowledge(tx.id)}
                              loading={actionLoading === tx.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Acknowledge & Complete Donation
                            </Button>
                            <span className="text-[11px] text-slate-500">
                              Awards reward points and closes the loop
                            </span>
                          </div>
                        )}

                        {tx.status === "CLOSED" && (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            Acknowledged & Closed
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!proof && tx.status === "DELIVERED" && (
                    <div className="border-t border-slate-100 bg-amber-50/50 p-4 px-6 text-xs text-amber-800">
                      Food marked as delivered. Awaiting distribution proof upload by {claimantName}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
