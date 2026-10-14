import {
  Clock3,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "../ui/Button";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { SlaStatusBadge } from "./SlaStatusBadge";
import { TransactionTimeline } from "./TransactionTimeline";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TransactionCard({
  transaction,
  onPickup,
  onDelivery,
  onSubmitProof,
  actionLoading = false,
}) {
  const listing = transaction?.listing;
  const outlet = listing?.outlet;
  const donor = outlet?.donor;
  const proof = transaction?.proof;

  const canPickup =
    transaction?.status === "ACTIVE" &&
    !transaction?.pickupAt;

  const canDeliver =
    transaction?.status === "ACTIVE" &&
    Boolean(transaction?.pickupAt) &&
    !transaction?.deliveredAt;

  const canSubmitProof =
    transaction?.status === "DELIVERED" &&
    !proof;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {listing?.title || "Food Donation"}
                </h3>

                <p className="mt-0.5 text-sm text-slate-500">
                  {listing?.category || "Food listing"}
                </p>
              </div>

              <TransactionStatusBadge status={transaction?.status} />
            </div>
          </div>

          <SlaStatusBadge status={transaction?.slaStatus} />
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quantity
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {listing?.quantity ?? "—"} {listing?.unit || ""}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Donor
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {donor?.organizationName || "Donor organization"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Outlet
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {outlet?.name || "Outlet"}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="border-t border-slate-100 px-6 py-4">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>{outlet?.address || "Pickup location unavailable"}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-slate-100 p-6">
        <p className="mb-5 text-sm font-bold text-slate-900">
          Donation lifecycle
        </p>
        <TransactionTimeline transaction={transaction} />
      </div>

      {/* Timestamps */}
      <div className="grid border-t border-slate-100 md:grid-cols-2">
        <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Truck className="h-3.5 w-3.5" />
            Pickup
          </div>

          <p className="mt-2 text-sm text-slate-700">
            {transaction?.pickupAt
              ? formatDate(transaction.pickupAt)
              : "Not completed"}
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Delivery
          </div>

          <p className="mt-2 text-sm text-slate-700">
            {transaction?.deliveredAt
              ? formatDate(transaction.deliveredAt)
              : "Not completed"}
          </p>
        </div>
      </div>

      {/* Proof Display If Submitted */}
      {proof && (
        <div className="border-t border-slate-100 bg-emerald-50/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {proof.imageUrl ? (
                <a
                  href={proof.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-200 bg-white"
                >
                  <img
                    src={proof.imageUrl}
                    alt="Proof"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </a>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ImageIcon size={20} />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Proof of Distribution Submitted
                  </span>
                  {transaction.status === "CLOSED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Awaiting Donor Verification
                    </span>
                  )}
                </div>

                {proof.notes && (
                  <p className="mt-1 text-xs text-slate-600">
                    "{proof.notes}"
                  </p>
                )}

                {proof.beneficiaryCount && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <Users size={12} />
                    {proof.beneficiaryCount} beneficiaries served
                  </p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {formatDate(proof.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {(canPickup || canDeliver || canSubmitProof) && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4" />
            {canPickup
              ? "Confirm once the food has been collected from the outlet."
              : canDeliver
              ? "Confirm once the food has reached the distribution point."
              : "Upload a handover photo to complete distribution verification."}
          </div>

          <div className="flex items-center gap-2">
            {canPickup && (
              <Button
                onClick={() => onPickup(transaction.id)}
                loading={actionLoading}
              >
                <Truck className="h-4 w-4" />
                Confirm Pickup
              </Button>
            )}

            {canDeliver && (
              <Button
                onClick={() => onDelivery(transaction.id)}
                loading={actionLoading}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Delivery
              </Button>
            )}

            {canSubmitProof && (
              <Button
                onClick={() => onSubmitProof && onSubmitProof(transaction)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Camera className="h-4 w-4" />
                Submit Delivery Proof
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}