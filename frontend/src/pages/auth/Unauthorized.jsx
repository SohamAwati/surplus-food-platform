import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

export function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldX className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Access denied
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          You don't have permission to access this area.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}