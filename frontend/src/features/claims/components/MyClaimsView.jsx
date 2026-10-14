import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Clock,
  RefreshCw,
  Loader2,
  ClipboardList,
  Truck,
  ArrowRight,
  Utensils,
} from "lucide-react";

import { getMyClaims } from "../claim.api";
import { useAuthStore } from "../../../store/auth.store";

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-amber-50 text-amber-700 border border-amber-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 border border-slate-200",
    REJECTED: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status?.replaceAll("_", " ") || "UNKNOWN"}
    </span>
  );
}

function ClaimCard({ claim, transactionsPath }) {
  const navigate = useNavigate();
  const listing = claim.listing;

  const quantity =
    listing?.quantity !== null && listing?.quantity !== undefined
      ? Number(listing.quantity)
      : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Claim #{claim.id.slice(0, 8)}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {listing?.title || "Food Listing"}
            </h3>
          </div>

          <StatusBadge status={claim.status} />
        </div>
      </div>

      <div className="space-y-3 p-5 flex-1">
        {quantity !== null && (
          <div className="flex items-center gap-3 text-sm">
            <Package size={17} className="text-slate-400" />
            <span className="text-slate-500">Quantity</span>
            <span className="ml-auto font-medium text-slate-800">
              {quantity} {listing?.unit || ""}
            </span>
          </div>
        )}

        {listing?.outlet && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={17} className="mt-0.5 text-slate-400 shrink-0" />
            <div>
              <p className="font-medium text-slate-800">
                {listing.outlet.name}
              </p>
              <p className="text-slate-500 text-xs">
                {listing.outlet.address}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <Clock size={17} className="text-slate-400" />
          <span className="text-slate-500">Claimed on</span>
          <span className="ml-auto text-slate-700 text-xs">
            {new Date(claim.createdAt).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        {claim.notes && (
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Notes: </span>
            {claim.notes}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="border-t border-slate-100 bg-slate-50/60 p-4">
        {claim.status === "ACTIVE" ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-amber-800">
              Ready for pickup & delivery
            </span>
            <button
              onClick={() => navigate(transactionsPath)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Truck size={14} />
              Manage Delivery
              <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Transaction finalized
            </span>
            <button
              onClick={() => navigate(transactionsPath)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View in Deliveries
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyClaimsView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "NGO";

  const transactionsPath =
    role === "VOLUNTEER" ? "/volunteer/transactions" : "/ngo/transactions";
  const listingsPath =
    role === "VOLUNTEER" ? "/volunteer/listings" : "/ngo/listings";

  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadClaims = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const response = await getMyClaims();
      setClaims(response?.data || []);
    } catch (err) {
      setError(err?.message || "Unable to load your claims.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const filteredClaims = useMemo(() => {
    if (filter === "ALL") return claims;
    return claims.filter((c) => c.status === filter);
  }, [claims, filter]);

  const activeClaimsCount = claims.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Food Rescue
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            My Food Claims
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep track of food reservations made by your organization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => loadClaims(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>

          <button
            onClick={() => navigate(transactionsPath)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Truck size={16} />
            Deliveries & Transactions
            {activeClaimsCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
                {activeClaimsCount} active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {["ALL", "ACTIVE", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filter === tab
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab === "ALL" ? `All Claims (${claims.length})` : `${tab} (${claims.filter(c => c.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin text-emerald-600" />
            Loading your claims...
          </div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ClipboardList size={26} className="text-slate-400" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No claims found
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            {filter !== "ALL"
              ? `You don't have any claims with status "${filter}".`
              : "You haven't claimed any surplus food listings yet."}
          </p>

          <button
            onClick={() => navigate(listingsPath)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Utensils size={16} />
            Browse Available Food
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              transactionsPath={transactionsPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}