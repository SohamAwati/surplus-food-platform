import { useEffect, useState } from "react";
import {
  Building2,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  X,
} from "lucide-react";

import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import {
  createDonorOutlet,
  deleteDonorOutlet,
  getDonorOutlets,
  updateDonorOutlet,
} from "../../features/donor/donor.api";

const emptyForm = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
};

export function DonorOutlets() {
  const [outlets, setOutlets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadOutlets = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDonorOutlets();

      setOutlets(response.data ?? []);
    } catch (err) {
      console.error("Failed to load outlets:", err);

      setError(
        err?.message || "Unable to load your outlets."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOutlets();
  }, []);

  const openCreateModal = () => {
    setEditingOutlet(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (outlet) => {
    setEditingOutlet(outlet);

    setForm({
      name: outlet.name ?? "",
      address: outlet.address ?? "",
      latitude:
        outlet.latitude !== undefined &&
        outlet.latitude !== null
          ? String(outlet.latitude)
          : "",
      longitude:
        outlet.longitude !== undefined &&
        outlet.longitude !== null
          ? String(outlet.longitude)
          : "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setShowModal(false);
    setEditingOutlet(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Outlet name is required.");
      return;
    }

    if (!form.address.trim()) {
      setFormError("Outlet address is required.");
      return;
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      form.latitude !== "" &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      setFormError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      form.longitude !== "" &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setFormError(
        "Longitude must be between -180 and 180."
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
    };

    if (form.latitude !== "") {
      payload.latitude = latitude;
    }

    if (form.longitude !== "") {
      payload.longitude = longitude;
    }

    setIsSaving(true);

    try {
      if (editingOutlet) {
        await updateDonorOutlet(
          editingOutlet.id,
          payload
        );
      } else {
        await createDonorOutlet(payload);
      }

      closeModal();
      await loadOutlets();
    } catch (err) {
      console.error("Failed to save outlet:", err);

      setFormError(
        err?.message ||
          "Unable to save outlet. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (outlet) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${outlet.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteDonorOutlet(outlet.id);

      await loadOutlets();
    } catch (err) {
      console.error("Failed to delete outlet:", err);

      setError(
        err?.message ||
          "Unable to delete the outlet."
      );
    }
  };

  const activeCount = outlets.filter(
    (outlet) => outlet.isActive !== false
  ).length;

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
              Your Outlets
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the branches and locations from which
              you donate surplus food.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={loadOutlets}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={
                  isLoading ? "animate-spin" : ""
                }
              />
              Refresh
            </Button>

            <Button onClick={openCreateModal}>
              <Plus size={17} />
              Add Outlet
            </Button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-medium text-red-800">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={Store}
            label="Total outlets"
            value={outlets.length}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={Building2}
            label="Active outlets"
            value={activeCount}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={MapPin}
            label="Locations"
            value={outlets.length}
            iconClass="bg-violet-50 text-violet-600"
          />

        </div>

        {/* OUTLETS */}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Outlet list
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All branches connected to your donor account.
              </p>
            </div>

            <Badge variant="success">
              {activeCount} active
            </Badge>
          </div>

          <div className="mt-5">

            {isLoading ? (
              <OutletSkeleton />
            ) : outlets.length === 0 ? (
              <EmptyState onAdd={openCreateModal} />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {outlets.map((outlet) => (
                  <OutletCard
                    key={outlet.id}
                    outlet={outlet}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

          </div>
        </Card>

      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingOutlet
                    ? "Edit outlet"
                    : "Add new outlet"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingOutlet
                    ? "Update your outlet information."
                    : "Add a branch where surplus food can be donated."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <Input
                label="Outlet name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Pune Central Branch"
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete outlet address"
                  rows={3}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Input
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="18.5204"
                />

                <Input
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="73.8567"
                />

              </div>

              <p className="text-xs leading-5 text-slate-400">
                Coordinates are used later for location-aware
                listing discovery and matching.
              </p>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingOutlet ? (
                        <Edit3 size={16} />
                      ) : (
                        <Plus size={16} />
                      )}

                      {editingOutlet
                        ? "Save Changes"
                        : "Create Outlet"}
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
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
  iconClass,
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-0.5 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}


/* ================================================================
   OUTLET CARD
================================================================ */

function OutletCard({
  outlet,
  onEdit,
  onDelete,
}) {
  const isActive = outlet.isActive !== false;

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Store size={20} />
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-slate-900">
                {outlet.name}
              </h3>

              <Badge
                variant={
                  isActive ? "success" : "default"
                }
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0"
              />

              <span>
                {outlet.address ||
                  "No address provided"}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* LOCATION */}

      {(outlet.latitude !== undefined ||
        outlet.longitude !== undefined) && (
        <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={13} />

            <span>
              {outlet.latitude ?? "—"},{" "}
              {outlet.longitude ?? "—"}
            </span>
          </div>
        </div>
      )}

      {/* ACTIONS */}

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">

        <Button
          variant="secondary"
          onClick={() => onEdit(outlet)}
        >
          <Edit3 size={15} />
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={() => onDelete(outlet)}
        >
          <Trash2 size={15} />
          Delete
        </Button>

      </div>
    </div>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Store size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No outlets added yet
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        Add your first outlet to start managing surplus
        food donations from your branches.
      </p>

      <div className="mt-5">
        <Button onClick={onAdd}>
          <Plus size={16} />
          Add First Outlet
        </Button>
      </div>

    </div>
  );
}


/* ================================================================
   SKELETON
================================================================ */

function OutletSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-2xl bg-slate-100"
        />
      ))}

    </div>
  );
}