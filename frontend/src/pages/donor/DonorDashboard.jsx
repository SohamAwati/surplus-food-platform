import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Leaf,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Store,
  TrendingUp,
  Utensils,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

import {
  getDonorProfile,
  getDonorOutlets,
} from "../../features/donor/donor.api";

export function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [outlets, setOutlets] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [profileResponse, outletsResponse] = await Promise.all([
        getDonorProfile(),
        getDonorOutlets(),
      ]);

      setProfile(profileResponse.data);
      setOutlets(outletsResponse.data ?? []);
    } catch (err) {
      console.error("Failed to load donor dashboard:", err);

      setError(
        err?.message ||
          "Unable to load your donor dashboard. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const donorName =
    profile?.contactName ||
    profile?.organizationName ||
    "Donor";

  const organizationName =
    profile?.organizationName ||
    profile?.contactName ||
    "Your organization";

  const activeOutlets = outlets.filter(
    (outlet) => outlet.isActive !== false
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Donor Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {donorName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your surplus food and make every donation count.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={loadDashboard}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
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

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-red-800">
                  Unable to load dashboard
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="text-sm font-medium text-red-700 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            LOADING
        ============================================================ */}

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* ========================================================
                ORGANIZATION / PROFILE CARD
            ======================================================== */}

            <Card className="overflow-hidden">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Building2 size={25} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Donor organization
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {organizationName}
                    </h2>

                    {profile?.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.phone}
                      </p>
                    )}

                    {profile?.address && (
                      <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0"
                        />

                        <span>{profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="success">
                    Verified donor
                  </Badge>

                  <Link to="/donor/profile">
                    <Button variant="secondary">
                      Manage Profile
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* ========================================================
                STATS
            ======================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Active Listings"
                value="12"
                description="Currently available"
                icon={Utensils}
                iconClass="bg-emerald-50 text-emerald-600"
                trend="+3 this week"
              />

              <StatCard
                title="Food Rescued"
                value="246 kg"
                description="Total food diverted"
                icon={Leaf}
                iconClass="bg-green-50 text-green-600"
                trend="+18% this month"
              />

              <StatCard
                title="Active Outlets"
                value={activeOutlets.length}
                description="Connected branches"
                icon={Store}
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="Successful Claims"
                value="28"
                description="Completed donations"
                icon={PackageCheck}
                iconClass="bg-violet-50 text-violet-600"
                trend="+6 this month"
              />

            </div>

            {/* ========================================================
                MAIN CONTENT
            ======================================================== */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* ======================================================
                  OUTLETS
              ====================================================== */}

              <Card className="xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Your outlets
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your branches and donation locations.
                    </p>
                  </div>

                  <Link to="/donor/outlets">
                    <Button variant="secondary">
                      Manage
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>

                <div className="mt-5 space-y-3">

                  {activeOutlets.length === 0 ? (
                    <EmptyOutlets />
                  ) : (
                    activeOutlets.slice(0, 4).map((outlet) => (
                      <OutletRow
                        key={outlet.id}
                        outlet={outlet}
                      />
                    ))
                  )}

                </div>
              </Card>

              {/* ======================================================
                  IMPACT CARD
              ====================================================== */}

              <Card className="relative overflow-hidden border-emerald-100 bg-emerald-50/60">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/70" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <TrendingUp size={21} />
                    </div>

                    <Badge variant="success">
                      This month
                    </Badge>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-slate-900">
                    Your impact
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Every surplus meal you donate helps reduce food waste
                    and supports communities in need.
                  </p>

                  <div className="mt-6 space-y-4">

                    <ImpactMetric
                      label="Food rescued"
                      value="246 kg"
                    />

                    <ImpactMetric
                      label="Successful donations"
                      value="28"
                    />

                    <ImpactMetric
                      label="Estimated meals saved"
                      value="492"
                    />

                  </div>

                  <div className="mt-6 border-t border-emerald-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        View full impact
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* ========================================================
                RECENT ACTIVITY
            ======================================================== */}

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest activity across your donations.
                  </p>
                </div>

                <Link
                  to="/donor/transactions"
                  className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  View all
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="mt-5 divide-y divide-slate-100">

                <ActivityRow
                  icon={CheckCircle2}
                  title="Donation successfully completed"
                  description="Your surplus food donation was delivered."
                  time="Today, 11:40 AM"
                  status="Completed"
                />

                <ActivityRow
                  icon={Clock3}
                  title="New claim received"
                  description="A nearby organization claimed your listing."
                  time="Yesterday, 4:20 PM"
                  status="Claimed"
                />

                <ActivityRow
                  icon={PackageCheck}
                  title="Food pickup confirmed"
                  description="Pickup was confirmed for your latest donation."
                  time="Yesterday, 12:15 PM"
                  status="Picked up"
                />

              </div>
            </Card>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}


/* ======================================================================
   STAT CARD
====================================================================== */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  trend,
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

        {trend && (
          <span className="text-xs font-medium text-emerald-600">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {title}
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


/* ======================================================================
   OUTLET ROW
====================================================================== */

function OutletRow({ outlet }) {
  return (
    <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/40">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <Store size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {outlet.name}
            </h3>

            {outlet.isActive !== false && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </div>

          <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin
              size={13}
              className="mt-0.5 shrink-0"
            />

            <span className="truncate">
              {outlet.address || "No address provided"}
            </span>
          </div>
        </div>
      </div>

      <ChevronRight
        size={17}
        className="ml-3 shrink-0 text-slate-300 transition group-hover:text-emerald-500"
      />
    </div>
  );
}


/* ======================================================================
   EMPTY OUTLETS
====================================================================== */

function EmptyOutlets() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Store size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        No outlets yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Add your first outlet to start creating surplus food listings.
      </p>

      <div className="mt-4">
        <Link to="/donor/outlets">
          <Button>
            <Plus size={16} />
            Add Outlet
          </Button>
        </Link>
      </div>
    </div>
  );
}


/* ======================================================================
   IMPACT METRIC
====================================================================== */

function ImpactMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}


/* ======================================================================
   ACTIVITY ROW
====================================================================== */

function ActivityRow({
  icon: Icon,
  title,
  description,
  time,
  status,
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>

          <span className="text-xs text-slate-400">
            {time}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <Badge variant="success">
        {status}
      </Badge>
    </div>
  );
}


/* ======================================================================
   DASHBOARD SKELETON
====================================================================== */

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      <div className="h-28 rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-slate-200 xl:col-span-2" />

        <div className="h-80 rounded-2xl bg-slate-200" />
      </div>

      <div className="h-64 rounded-2xl bg-slate-200" />

    </div>
  );
}