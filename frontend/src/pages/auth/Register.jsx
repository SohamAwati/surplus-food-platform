import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  HeartHandshake,
  Users,
  Utensils,
  MapPin,
  Phone,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registerStore = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const initialRole = searchParams.get("role")?.toUpperCase();
  const validRole = ["DONOR", "NGO", "VOLUNTEER"].includes(initialRole)
    ? initialRole
    : "DONOR";

  const [role, setRole] = useState(validRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Profile details
  const [organizationName, setOrganizationName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("Two-Wheeler / Scooter");
  const [beneficiaryCount, setBeneficiaryCount] = useState("50");

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (initialRole && ["DONOR", "NGO", "VOLUNTEER"].includes(initialRole)) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!email.trim() || !password) {
      setValidationError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (role === "DONOR" && !organizationName.trim()) {
      setValidationError("Please enter your restaurant, kitchen, or business name.");
      return;
    }

    if (role === "NGO" && !organizationName.trim()) {
      setValidationError("Please enter your organization or non-profit name.");
      return;
    }

    if (role === "VOLUNTEER" && !contactName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    const payload = {
      email: email.trim().toLowerCase(),
      password,
      role,
      organizationName: organizationName.trim(),
      contactName: contactName.trim(),
      name: contactName.trim() || organizationName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      vehicleType,
      beneficiaryCount: Number(beneficiaryCount) || 50,
    };

    const res = await registerStore(payload);

    if (res?.success) {
      if (role === "DONOR") navigate("/donor");
      else if (role === "NGO") navigate("/ngo/listings");
      else if (role === "VOLUNTEER") navigate("/volunteer/listings");
      else navigate("/");
    } else {
      setValidationError(res?.error || "Registration failed. Please check your details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Leaf className="h-6 w-6 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-left">
              <span className="text-xl font-black tracking-tight text-white block">
                SURPLUS
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 block">
                Food Rescue Network
              </span>
            </div>
          </Link>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create your Surplus account
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Join the city-wide platform connecting excess food with hungry families.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          {/* Step 1: Choose Role */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              1. Select Your Role in the Network
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Donor */}
              <button
                type="button"
                onClick={() => setRole("DONOR")}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  role === "DONOR"
                    ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/30"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  role === "DONOR" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-white/5 text-slate-400"
                }`}>
                  <Utensils size={20} />
                </div>
                <span className="mt-2.5 text-xs font-bold block">Food Donor</span>
                <span className="mt-0.5 text-[10px] text-slate-500 block leading-tight">
                  Restaurant, Grocer, Catering
                </span>
              </button>

              {/* NGO */}
              <button
                type="button"
                onClick={() => setRole("NGO")}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  role === "NGO"
                    ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/30"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  role === "NGO" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-white/5 text-slate-400"
                }`}>
                  <HeartHandshake size={20} />
                </div>
                <span className="mt-2.5 text-xs font-bold block">NGO / Charity</span>
                <span className="mt-0.5 text-[10px] text-slate-500 block leading-tight">
                  Shelter, Food Bank, Pantry
                </span>
              </button>

              {/* Volunteer */}
              <button
                type="button"
                onClick={() => setRole("VOLUNTEER")}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                  role === "VOLUNTEER"
                    ? "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/30"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  role === "VOLUNTEER" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-white/5 text-slate-400"
                }`}>
                  <Truck size={20} />
                </div>
                <span className="mt-2.5 text-xs font-bold block">Volunteer</span>
                <span className="mt-0.5 text-[10px] text-slate-500 block leading-tight">
                  Rescue Courier Driver
                </span>
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2 border-t border-white/5">
              2. Account & Profile Details
            </p>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@yourorganization.org"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Inputs */}
            {role === "DONOR" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Food Business / Restaurant / Kitchen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Green Leaf Bistro, Fresh Delights Kitchen"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Chef Marco"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pickup Location / Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 104 Marine Drive, Central District"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {role === "NGO" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NGO / Charitable Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Hope Shelter & Food Bank"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Representative Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Beneficiary Capacity (Estimated)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={beneficiaryCount}
                      onChange={(e) => setBeneficiaryCount(e.target.value)}
                      placeholder="e.g. 50 people"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Distribution Center Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 24 Community Welfare Center, West Zone"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {role === "VOLUNTEER" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. David Kumar"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Transport Mode
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 px-3.5 text-xs text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Two-Wheeler / Scooter">Two-Wheeler / Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car / Hatchback">Car / Hatchback</option>
                    <option value="Van / Commercial Carrier">Van / Commercial Carrier</option>
                    <option value="On Foot / Transit">On Foot / Public Transit</option>
                  </select>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    <span>Join as {role === "DONOR" ? "Food Donor" : role === "NGO" ? "NGO Partner" : "Volunteer Courier"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom link */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
