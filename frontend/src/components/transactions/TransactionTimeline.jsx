import { Check } from "lucide-react";

const steps = [
  {
    key: "CLAIMED",
    title: "Claimed",
    description:
      "The food listing has been successfully claimed.",
  },

  {
    key: "PICKED_UP",
    title: "Picked Up",
    description:
      "The food has been collected from the donor outlet.",
  },

  {
    key: "DELIVERED",
    title: "Delivered",
    description:
      "The food has been delivered to the recipient.",
  },
];

function getCurrentStep(transaction) {
  if (transaction?.deliveredAt) {
    return 2;
  }

  if (transaction?.pickupAt) {
    return 1;
  }

  return 0;
}

function formatDate(value) {
  if (!value) return null;

  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export function TransactionTimeline({
  transaction,
}) {
  const currentStep =
    getCurrentStep(transaction);

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const completed =
          index <= currentStep;

        const isCurrent =
          index === currentStep;

        return (
          <div
            key={step.key}
            className="relative flex gap-4"
          >
            {index <
              steps.length - 1 && (
              <div
                className={`absolute left-4 top-8 h-14 w-px ${
                  index < currentStep
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {completed && (
                <Check className="h-4 w-4" />
              )}
            </div>

            <div className="pb-8">
              <p
                className={`text-sm font-semibold ${
                  isCurrent
                    ? "text-slate-900"
                    : completed
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {step.title}
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                {step.description}
              </p>

              {step.key === "PICKED_UP" &&
                transaction?.pickupAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      transaction.pickupAt
                    )}
                  </p>
                )}

              {step.key === "DELIVERED" &&
                transaction?.deliveredAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      transaction.deliveredAt
                    )}
                  </p>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}