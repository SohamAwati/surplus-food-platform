import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Package,
  Clock,
  Utensils,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { getAvailableListings } from "../claim.api";
import ClaimModal from "./ClaimModal";

function formatExpiry(date) {
  const expiry = new Date(date);

  return expiry.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExpiryText(date) {
  const now = new Date();
  const expiry = new Date(date);

  const difference = expiry.getTime() - now.getTime();

  if (difference <= 0) {
    return "Expired";
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (hours > 24) {
    return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

function ListingCard({ listing, onClaim }) {
  const quantity =
    listing.quantity !== null && listing.quantity !== undefined
      ? Number(listing.quantity)
      : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Top */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Available
            </span>

            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {listing.title}
            </h3>

            {listing.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {listing.description}
              </p>
            )}
          </div>

          {listing.category && (
            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {listing.category}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-3 p-5">
        {quantity !== null && (
          <div className="flex items-center gap-3 text-sm">
            <Package size={17} className="text-slate-400" />

            <span className="text-slate-500">Quantity</span>

            <span className="ml-auto font-medium text-slate-800">
              {quantity} {listing.unit || ""}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm">
          <Clock size={17} className="text-slate-400" />

          <span className="text-slate-500">Expiry</span>

          <span className="ml-auto font-medium text-slate-800">
            {getExpiryText(listing.expiresAt)}
          </span>
        </div>

        {listing.outlet && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin
              size={17}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div className="min-w-0">
              <p className="font-medium text-slate-800">
                {listing.outlet.name}
              </p>

              <p className="truncate text-slate-500">
                {listing.outlet.address}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4">
        <span className="text-xs text-slate-500">
          Expires {formatExpiry(listing.expiresAt)}
        </span>

        <button
          type="button"
          onClick={() => onClaim(listing)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Claim Food
        </button>
      </div>
    </div>
  );
}

export default function AvailableListingsView() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);

  const loadListings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAvailableListings();

      setListings(response?.data || []);
    } catch (err) {
      setError(err?.message || "Unable to load available listings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return listings;
    }

    return listings.filter((listing) => {
      return (
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category?.toLowerCase().includes(query) ||
        listing.outlet?.name?.toLowerCase().includes(query) ||
        listing.outlet?.address?.toLowerCase().includes(query)
      );
    });
  }, [listings, search]);

  const handleClaimSuccess = () => {
    setSelectedListing(null);

    loadListings(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Food Rescue
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Available Food
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Find available surplus food and claim it for your organization.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadListings(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food, category, outlet or location..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
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
              Loading available food...
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Utensils size={24} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No available listings
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search terms."
                : "There are currently no food listings available for claiming."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {filteredListings.length}
                </span>{" "}
                listing{filteredListings.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClaim={setSelectedListing}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedListing && (
        <ClaimModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}