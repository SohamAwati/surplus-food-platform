import {
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from "lucide-react";

const config = {
  NOT_STARTED: {
    label: "SLA not started",
    icon: Circle,
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },

  RUNNING: {
    label: "SLA running",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  ON_TIME: {
    label: "On time",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  OVERDUE: {
    label: "Overdue",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function SlaStatusBadge({
  status,
}) {
  const item =
    config[status] ||
    config.NOT_STARTED;

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${item.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}