import {
  CheckCircle2,
  CircleDot,
  AlertCircle,
  XCircle,
} from "lucide-react";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    icon: CircleDot,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  CLOSED: {
    label: "Closed",
    icon: CheckCircle2,
    className:
      "border-slate-200 bg-slate-100 text-slate-700",
  },

  DISPUTED: {
    label: "Disputed",
    icon: AlertCircle,
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-slate-200 bg-slate-100 text-slate-500",
  },
};

export function TransactionStatusBadge({
  status,
}) {
  const config =
    statusConfig[status] ||
    statusConfig.ACTIVE;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}