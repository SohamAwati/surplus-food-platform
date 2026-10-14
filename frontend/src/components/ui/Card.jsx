export function Card({
  children,
  className = "",
  padding = true,
}) {
  return (
    <div
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-[0_1px_2px_rgba(15,23,42,0.04)]
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}