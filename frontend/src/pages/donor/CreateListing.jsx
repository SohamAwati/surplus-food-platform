import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Store,
  Utensils,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import {
  createListing,
} from "../../features/listings/listing.api";

import {
  getDonorOutlets,
} from "../../features/donor/donor.api";

const initialForm = {
  outletId: "",
  title: "",
  description: "",
  category: "",
  quantity: "",
  unit: "meals",
  preparedAt: "",
  expiresAt: "",
};

const categories = [
  "Prepared Food",
  "Bakery",
  "Fruits",
  "Vegetables",
  "Groceries",
  "Beverages",
  "Packaged Food",
  "Other",
];

const units = [
  "meals",
  "kg",
  "litres",
  "packets",
  "boxes",
  "pieces",
];

export function CreateListing() {
  const navigate = useNavigate();

  const [outlets, setOutlets] = useState([]);
  const [form, setForm] =
    useState(initialForm);

  const [isLoadingOutlets, setIsLoadingOutlets] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    setIsLoadingOutlets(true);

    try {
      const response =
        await getDonorOutlets();

      const activeOutlets =
        (response.data ?? []).filter(
          (outlet) =>
            outlet.isActive !== false
        );

      setOutlets(activeOutlets);

      if (activeOutlets.length > 0) {
        setForm((current) => ({
          ...current,
          outletId:
            current.outletId ||
            activeOutlets[0].id,
        }));
      }
    } catch (err) {
      console.error(
        "Failed to load outlets:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your outlets."
      );
    } finally {
      setIsLoadingOutlets(false);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.outletId) {
      setError(
        "Please select an outlet."
      );
      return;
    }

    if (!form.title.trim()) {
      setError(
        "Please enter a listing title."
      );
      return;
    }

    if (
      form.quantity !== "" &&
      Number(form.quantity) <= 0
    ) {
      setError(
        "Quantity must be greater than zero."
      );
      return;
    }

    if (!form.expiresAt) {
      setError(
        "Please provide an expiry date and time."
      );
      return;
    }

    const expiryDate =
      new Date(form.expiresAt);

    if (
      Number.isNaN(
        expiryDate.getTime()
      )
    ) {
      setError(
        "Please provide a valid expiry date."
      );
      return;
    }

    if (
      expiryDate.getTime() <=
      Date.now()
    ) {
      setError(
        "Expiry time must be in the future."
      );
      return;
    }

    const payload = {
      outletId: form.outletId,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      category: form.category || undefined,
      quantity:
        form.quantity !== "" && !isNaN(Number(form.quantity))
          ? Number(form.quantity)
          : undefined,
      unit: form.unit || undefined,
      preparedAt: form.preparedAt
        ? new Date(form.preparedAt).toISOString()
        : undefined,
      expiresAt: expiryDate.toISOString(),
    };

    setIsSaving(true);

    try {
      await createListing(
        payload
      );

      setSuccess(true);

      setTimeout(() => {
        navigate("/donor/listings");
      }, 700);
    } catch (err) {
      console.error(
        "Failed to create listing:",
        err
      );

      setError(
        err?.message ||
          "Unable to create listing."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOutlet =
    outlets.find(
      (outlet) =>
        outlet.id ===
        form.outletId
    );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* HEADER */}

        <div>
          <Link
            to="/donor/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={16} />
            Back to Listings
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium text-emerald-600">
              Donor Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Create Surplus Listing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Tell nearby organizations about
              food that is available for rescue.
            </p>
          </div>
        </div>


        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-medium text-red-800">
              Unable to create listing
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2
              size={18}
            />

            <span>
              Listing created successfully.
              Redirecting...
            </span>
          </div>
        )}


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* OUTLET */}

          <Card>
            <SectionHeader
              icon={Store}
              title="Donation location"
              description="Choose the outlet where the surplus food is available."
            />

            <div className="mt-5">

              {isLoadingOutlets ? (
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ) : outlets.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-amber-900">
                    No active outlets found
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Add an outlet before creating
                    a food listing.
                  </p>

                  <div className="mt-3">
                    <Link to="/donor/outlets">
                      <Button
                        variant="secondary"
                      >
                        <Plus size={16} />
                        Manage Outlets
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Outlet
                  </label>

                  <select
                    name="outletId"
                    value={form.outletId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {outlets.map(
                      (outlet) => (
                        <option
                          key={outlet.id}
                          value={outlet.id}
                        >
                          {outlet.name}
                        </option>
                      )
                    )}
                  </select>

                  {selectedOutlet && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {selectedOutlet.address}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>


          {/* FOOD INFORMATION */}

          <Card>
            <SectionHeader
              icon={Utensils}
              title="Food information"
              description="Provide details about the surplus food available."
            />

            <div className="mt-5 grid grid-cols-1 gap-5">

              <Input
                label="Listing title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Fresh vegetable meals"
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the food, packaging, dietary information, etc."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="25"
                />

              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Unit
                </label>

                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  {units.map(
                    (unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>
          </Card>


          {/* TIMING */}

          <Card>
            <SectionHeader
              icon={CalendarClock}
              title="Food timing"
              description="Tell recipients when the food was prepared and when it will no longer be available."
            />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <Input
                label="Prepared at"
                name="preparedAt"
                type="datetime-local"
                value={form.preparedAt}
                onChange={handleChange}
              />

              <Input
                label="Available until"
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={handleChange}
                required
              />

            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Info
                size={16}
                className="mt-0.5 shrink-0"
              />

              <p>
                Listings automatically become
                unavailable after their expiry
                time. Background expiry processing
                will be added in the worker phase.
              </p>
            </div>
          </Card>


          {/* SUBMIT */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link to="/donor/listings">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={
                isSaving ||
                isLoadingOutlets ||
                outlets.length === 0
              }
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Listing
                </>
              )}
            </Button>

          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}


/* ================================================================
   SECTION HEADER
================================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}