import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Save,
  Utensils,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import {
  getMyListing,
  updateListing,
} from "../../features/listings/listing.api";

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

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

export function EditListing() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    preparedAt: "",
    expiresAt: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadListing();
  }, [listingId]);

  async function loadListing() {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyListing(listingId);
      const data = response?.data;

      if (!data) {
        throw new Error("Listing not found.");
      }

      setListing(data);

      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        category: data.category ?? "",
        quantity:
          data.quantity !== null &&
          data.quantity !== undefined
            ? String(data.quantity)
            : "",
        unit: data.unit ?? "",
        preparedAt: toDateTimeLocal(data.preparedAt),
        expiresAt: toDateTimeLocal(data.expiresAt),
      });
    } catch (err) {
      setError(
        err.message || "Unable to load listing."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function validate() {
    if (!form.title.trim()) {
      return "Listing title is required.";
    }

    if (form.title.trim().length < 2) {
      return "Listing title must be at least 2 characters.";
    }

    if (form.quantity !== "") {
      const quantity = Number(form.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return "Quantity must be greater than 0.";
      }
    }

    if (!form.expiresAt) {
      return "Expiry date and time is required.";
    }

    const expiresAt = new Date(form.expiresAt);

    if (expiresAt <= new Date()) {
      return "Expiry time must be in the future.";
    }

    if (form.preparedAt) {
      const preparedAt = new Date(form.preparedAt);

      if (preparedAt > expiresAt) {
        return "Preparation time cannot be after expiry.";
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        quantity:
          form.quantity === ""
            ? undefined
            : Number(form.quantity),
        unit: form.unit,
        preparedAt: form.preparedAt
          ? new Date(form.preparedAt).toISOString()
          : undefined,
        expiresAt: new Date(
          form.expiresAt
        ).toISOString(),
      };

      await updateListing(listingId, payload);

      setSuccess("Listing updated successfully.");

      setTimeout(() => {
        navigate("/donor/listings");
      }, 700);
    } catch (err) {
      setError(
        err.message || "Unable to update listing."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!listing) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Listing not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This listing could not be loaded."}
            </p>

            <div className="mt-6">
              <Link to="/donor/listings">
                <Button>
                  Back to Listings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (listing.status !== "POSTED") {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">
          <Card className="p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3">
                <Utensils className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Listing cannot be edited
                </h2>

                <p className="text-sm text-slate-500">
                  Only listings that are currently posted
                  can be modified.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/donor/listings">
                <Button variant="secondary">
                  Back to Listings
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/donor/listings"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Donor Management
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Edit Listing
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update the details of your surplus food
              donation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="overflow-hidden">

            {/* Basic Information */}
            <div className="border-b border-slate-100 p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-slate-900">
                  Food Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Provide accurate information about the
                  available surplus food.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <Input
                    label="Listing title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Fresh Vegetable Meals"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="">
                      Select unit
                    </option>

                    {units.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the food, preparation details, packaging, etc."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

              </div>
            </div>

            {/* Timing */}
            <div className="border-b border-slate-100 p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-slate-900">
                  Timing
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Set when the food was prepared and when
                  it will no longer be available.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Preparation time
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="datetime-local"
                      name="preparedAt"
                      value={form.preparedAt}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Expiry time
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={form.expiresAt}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Alerts */}
            {(error || success) && (
              <div className="px-6 pt-6">
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 bg-slate-50 p-6 sm:flex-row sm:justify-end">

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
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}