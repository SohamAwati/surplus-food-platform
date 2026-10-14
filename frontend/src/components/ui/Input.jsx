export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`
          block w-full
          rounded-lg
          border
          bg-white
          px-3.5 py-2.5
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}