import { useState, useRef } from "react";
import {
  X,
  Upload,
  CheckCircle2,
  Camera,
  Loader2,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import { submitProof } from "../../features/transactions/transaction.api";
import { Button } from "../ui/Button";

export function SubmitProofModal({ transaction, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [beneficiaryCount, setBeneficiaryCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!transaction) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, WebP).");
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select or capture a photo of the food distribution proof.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }
      if (beneficiaryCount) {
        formData.append("beneficiaryCount", beneficiaryCount);
      }

      await submitProof(transaction.id, formData);
      onSuccess();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to upload proof. Please try again or check your image size."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Submit Proof of Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Upload handover confirmation photo for {transaction.listing?.title || "Food Listing"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo upload zone */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Distribution Photo *
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Proof preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl("");
                  }}
                  className="absolute right-3 top-3 rounded-xl bg-black/70 p-2 text-white hover:bg-black/90 transition shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Camera size={24} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Click to take or upload photo
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Handover receipt, distribution desk, or recipient confirmation
                </p>
              </div>
            )}
          </div>

          {/* Beneficiary count */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Users size={14} className="text-slate-400" />
              Beneficiaries Served (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={beneficiaryCount}
              onChange={(e) => setBeneficiaryCount(e.target.value)}
              placeholder="e.g. 25 people"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-slate-400" />
              Notes / Handover Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Distribution center, recipient organization, temperature check..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !file}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Uploading..." : "Submit Proof"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
