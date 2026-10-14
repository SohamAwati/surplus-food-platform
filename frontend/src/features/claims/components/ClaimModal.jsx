import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, Package, Clock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { createClaim } from "../claim.api";
import { useAuthStore } from "../../../store/auth.store";

export default function ClaimModal({ listing, onClose, onSuccess }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "NGO";

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);

  if (!listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await createClaim(listing.id, {
        notes: notes.trim(),
      });

      setClaimed(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to claim this listing. It may have already been claimed."
      );
    } finally {
      setLoading(false);
    }
  };

  const quantity =
    listing.quantity !== null && listing.quantity !== undefined
      ? Number(listing.quantity)
      : null;

  const targetTransactionsPath =
    role === "VOLUNTEER" ? "/volunteer/transactions" : "/ngo/transactions";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {claimed ? "Claim Confirmed" : "Claim Food"}
            </h2>
            <p className="text-sm text-slate-500">
              {claimed
                ? "Rescue transaction created and active."
                : "Confirm that you want to claim this listing."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (claimed) {
                onSuccess();
              } else {
                onClose();
              }
            }}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {claimed ? (
          /* Success Screen */
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Food Successfully Claimed!
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Your claim for <strong className="text-slate-900">{listing.title}</strong> has been confirmed. A delivery transaction has been automatically scheduled for pickup.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  navigate(targetTransactionsPath);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                Go to Rescue Deliveries
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => onSuccess()}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Browse More Food
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <>
            <div className="space-y-4 p-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {listing.title}
                </h3>

                {listing.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {listing.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quantity !== null && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Package size={16} />
                      <span className="text-xs">Quantity</span>
                    </div>

                    <p className="mt-1 font-medium text-slate-900">
                      {quantity} {listing.unit || ""}
                    </p>
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-xs">Expires</span>
                  </div>

                  <p className="mt-1 font-medium text-slate-900">
                    {new Date(listing.expiresAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {listing.outlet && (
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="font-medium text-emerald-900">
                      {listing.outlet.name}
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      {listing.outlet.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Claim Notes
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Estimated pickup time, vehicle info, or distribution plan..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {notes.length}/1000
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Claiming..." : "Confirm Claim"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}