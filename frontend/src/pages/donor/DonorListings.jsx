import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock3,
  Edit3,
  Eye,
  Filter,
  Leaf,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

import {
  cancelListing,
  getMyListings,
} from "../../features/listings/listing.api";

export function DonorListings() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const loadListings = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyListings();

      setListings(response.data ?? []);
    } catch (err) {
      console.error(
        "Failed to load listings:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your listings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const counts = useMemo(() => {
    return {
      all: listings.length,

      posted: listings.filter(
        (listing) => listing.status === "POSTED"
      ).length,

      claimed: listings.filter(
        (listing) => listing.status === "CLAIMED"
      ).length,

      expired: listings.filter(
        (listing) => listing.status === "EXPIRED"
      ).length,
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return listings.filter((listing) => {
      const matchesSearch =
        !query ||
        listing.title
          ?.toLowerCase()
          .includes(query) ||
        listing.category
          ?.toLowerCase()
          .includes(query) ||
        listing.outlet?.name
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        listing.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    listings,
    search,
    statusFilter,
  ]);

  const handleCancel = async (listing) => {
    const confirmed = window.confirm(
      `Cancel "${listing.title}"?`
    );

    if (!confirmed) return;

    try {
      await cancelListing(listing.id);

      await loadListings();
    } catch (err) {
      console.error(
        "Failed to cancel listing:",
        err
      );

      setError(
        err?.message ||
          "Unable to cancel this listing."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Donor Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Surplus Listings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage your surplus food
              donations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={loadListings}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </Button>

            <Link to="/donor/listings/new">
              <Button>
                <Plus size={17} />
                Create Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-medium text-red-800">
              Unable to load listings
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            icon={Package}
            label="Total listings"
            value={counts.all}
            description="All your listings"
            iconClass="bg-slate-100 text-slate-600"
          />

          <SummaryCard
            icon={Leaf}
            label="Available"
            value={counts.posted}
            description="Currently available"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={Utensils}
            label="Claimed"
            value={counts.claimed}
            description="Claimed by recipients"
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={Clock3}
            label="Expired"
            value={counts.expired}
            description="No longer available"
            iconClass="bg-slate-100 text-slate-500"
          />

        </div>

        {/* FILTERS */}

        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search listings..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <Filter
                size={16}
                className="mr-1 text-slate-400"
              />

              <FilterButton
                active={statusFilter === "ALL"}
                onClick={() =>
                  setStatusFilter("ALL")
                }
              >
                All ({counts.all})
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "POSTED"
                }
                onClick={() =>
                  setStatusFilter("POSTED")
                }
              >
                Available ({counts.posted})
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "CLAIMED"
                }
                onClick={() =>
                  setStatusFilter("CLAIMED")
                }
              >
                Claimed ({counts.claimed})
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "EXPIRED"
                }
                onClick={() =>
                  setStatusFilter("EXPIRED")
                }
              >
                Expired ({counts.expired})
              </FilterButton>

            </div>
          </div>
        </Card>

        {/* LISTINGS */}

        {isLoading ? (
          <ListingsSkeleton />
        ) : filteredListings.length === 0 ? (
          <EmptyListings
            hasFilters={
              search.trim() !== "" ||
              statusFilter !== "ALL"
            }
            onClear={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {filteredListings.map(
              (listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onCancel={handleCancel}
                />
              )
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}


/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </Card>
  );
}


/* ================================================================
   FILTER BUTTON
================================================================ */

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}


/* ================================================================
   LISTING CARD
================================================================ */

function ListingCard({
  listing,
  onCancel,
}) {
  const isPosted =
    listing.status === "POSTED";

  const isExpired =
    listing.status === "EXPIRED";

  const expiresAt = listing.expiresAt
    ? new Date(listing.expiresAt)
    : null;

  const isExpiredByTime =
    expiresAt &&
    expiresAt.getTime() <= Date.now();

  return (
    <Card className="overflow-hidden p-0">

      {/* TOP */}

      <div className="border-b border-slate-100 px-5 py-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex min-w-0 items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Utensils size={20} />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="truncate text-base font-semibold text-slate-900">
                  {listing.title}
                </h2>

                <ListingStatusBadge
                  status={listing.status}
                />

              </div>

              {listing.category && (
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {listing.category}
                </p>
              )}

            </div>
          </div>

        </div>

        {listing.description && (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {listing.description}
          </p>
        )}

      </div>


      {/* DETAILS */}

      <div className="grid grid-cols-2 gap-px bg-slate-100">

        <DetailCell
          label="Quantity"
          value={
            listing.quantity
              ? `${listing.quantity} ${
                  listing.unit || ""
                }`
              : "Not specified"
          }
        />

        <DetailCell
          label="Outlet"
          value={
            listing.outlet?.name ||
            "Unknown outlet"
          }
        />

      </div>


      {/* FOOTER */}

      <div className="px-5 py-4">

        <div className="flex items-start gap-2 text-sm text-slate-500">

          <MapPin
            size={15}
            className="mt-0.5 shrink-0"
          />

          <span className="truncate">
            {listing.outlet?.address ||
              "No outlet address"}
          </span>

        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">

          <Clock3 size={14} />

          <span>
            {isExpiredByTime || isExpired
              ? "Expired"
              : expiresAt
                ? `Expires ${formatDate(
                    expiresAt
                  )}`
                : "No expiry"}
          </span>

        </div>


        {/* ACTIONS */}

        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">

          {isPosted && (
            <>
              <Link
                to={`/donor/listings/${listing.id}/edit`}
              >
                <Button variant="secondary">
                  <Edit3 size={15} />
                  Edit
                </Button>
              </Link>

              <Button
                variant="danger"
                onClick={() =>
                  onCancel(listing)
                }
              >
                <Trash2 size={15} />
                Cancel
              </Button>
            </>
          )}

          {!isPosted && (
            <Button
              variant="secondary"
              disabled
            >
              <Eye size={15} />
              View Details
            </Button>
          )}

        </div>

      </div>

    </Card>
  );
}


/* ================================================================
   DETAIL CELL
================================================================ */

function DetailCell({
  label,
  value,
}) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}


/* ================================================================
   STATUS BADGE
================================================================ */

function ListingStatusBadge({
  status,
}) {
  const config = {
    POSTED: {
      label: "Available",
      variant: "success",
    },

    CLAIMED: {
      label: "Claimed",
      variant: "info",
    },

    PICKED_UP: {
      label: "Picked up",
      variant: "info",
    },

    DELIVERED: {
      label: "Delivered",
      variant: "success",
    },

    CLOSED: {
      label: "Closed",
      variant: "default",
    },

    EXPIRED: {
      label: "Expired",
      variant: "default",
    },
  };

  const current =
    config[status] || {
      label: status,
      variant: "default",
    };

  return (
    <Badge variant={current.variant}>
      {current.label}
    </Badge>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyListings({
  hasFilters,
  onClear,
}) {
  return (
    <Card>
      <div className="py-12 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          {hasFilters ? (
            <Search size={24} />
          ) : (
            <Package size={24} />
          )}
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900">
          {hasFilters
            ? "No matching listings"
            : "No listings yet"}
        </h2>

        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
          {hasFilters
            ? "Try changing your search or status filter."
            : "Create your first surplus food listing to make it available for rescue."}
        </p>

        <div className="mt-5">

          {hasFilters ? (
            <Button
              variant="secondary"
              onClick={onClear}
            >
              Clear filters
            </Button>
          ) : (
            <Link to="/donor/listings/new">
              <Button>
                <Plus size={16} />
                Create Listing
              </Button>
            </Link>
          )}

        </div>

      </div>
    </Card>
  );
}


/* ================================================================
   SKELETON
================================================================ */

function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-2xl bg-slate-100"
          />
        )
      )}

    </div>
  );
}


/* ================================================================
   DATE FORMAT
================================================================ */

function formatDate(date) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}