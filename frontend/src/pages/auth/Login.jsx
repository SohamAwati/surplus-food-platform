import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuthStore } from "../../store/auth.store";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);

  const [email, setEmail] = useState("donor@surplus.local");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  /*
   * Decide the first page for each role.
   */
  function getRoleHome(role) {
    switch (role) {
      case "DONOR":
        return "/donor";

      case "NGO":
        return "/ngo/listings";

      case "VOLUNTEER":
        return "/volunteer/listings";

      case "ADMIN":
        return "/admin";

      default:
        return "/unauthorized";
    }
  }

  /*
   * Login handler
   */
  async function handleSubmit(event) {
    event.preventDefault();

    setValidationError("");

    if (!email.trim() || !password) {
      setValidationError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      /*
       * auth.store.js returns:
       *
       * {
       *   success: true,
       *   user: {...}
       * }
       */
      const result = await login(
        email.trim(),
        password
      );

      /*
       * Login failed.
       * auth.store already sets the error message.
       */
      if (!result?.success) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * The store returns `user` directly.
       *
       * NOT:
       * result.data.user
       *
       * BUT:
       * result.user
       */
      const user = result?.user;

      if (!user?.role) {
        setValidationError(
          "Login succeeded, but the user role could not be determined."
        );
        return;
      }

      console.log(
        "REDIRECTING USER:",
        user.role,
        "→",
        getRoleHome(user.role)
      );

      /*
       * Redirect based on role.
       */
      navigate(getRoleHome(user.role), {
        replace: true,
      });
    } catch (error) {
      console.error(
        "LOGIN NAVIGATION ERROR:",
        error
      );
    }
  }

  const error = validationError || storeError;

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            BRAND PANEL
        ====================================================== */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.10),transparent_30%)]" />

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <Leaf
                  className="h-5 w-5 text-white"
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="font-bold tracking-tight text-white">
                  SURPLUS
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Food Rescue
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-lg">
              <p className="text-sm font-semibold text-emerald-400">
                FOOD • IMPACT • COMMUNITY
              </p>

              <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
                Turning surplus food into meaningful impact.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Connect surplus food with organizations and
                communities that need it most.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />

                Secure platform with role-based access
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-slate-600">
              © 2026 Surplus Food Rescue Platform
            </p>
          </div>
        </section>

        {/* =====================================================
            LOGIN PANEL
        ====================================================== */}
        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <Leaf className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  SURPLUS
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Food Rescue
                </p>
              </div>
            </div>

            {/* Heading */}
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Sign in to Surplus
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage donations, outlets and your community
                impact from one place.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />

                <Mail className="pointer-events-none absolute right-3.5 top-[37px] h-4 w-4 text-slate-400" />
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3.5 top-[37px] text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Sign in

                {!isLoading && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>

              {/* Register Link */}
              <div className="pt-2 text-center text-xs text-slate-600">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Join as Donor, NGO, or Volunteer &rarr;
                </Link>
              </div>

            {/* Security */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" />

              Your connection is securely authenticated
            </div>

            {/* Quick Demo Accounts */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Quick Demo Logins (Click to fill)
                </p>
                <span className="text-[10px] text-slate-400">Password@123</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("donor@surplus.local");
                    setPassword("Password@123");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <p className="font-bold text-slate-900">Donor</p>
                  <p className="text-[11px] text-slate-400 truncate">donor@surplus.local</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("ngo@surplus.local");
                    setPassword("Password@123");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <p className="font-bold text-slate-900">NGO</p>
                  <p className="text-[11px] text-slate-400 truncate">ngo@surplus.local</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("volunteer@surplus.local");
                    setPassword("Password@123");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <p className="font-bold text-slate-900">Volunteer</p>
                  <p className="text-[11px] text-slate-400 truncate">volunteer@surplus.local</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@surplus.local");
                    setPassword("Password@123");
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <p className="font-bold text-slate-900">Admin</p>
                  <p className="text-[11px] text-slate-400 truncate">admin@surplus.local</p>
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}