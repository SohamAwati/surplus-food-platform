import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Utensils,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Users,
  Award,
  ChevronDown,
  Building2,
  Globe,
  Camera,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

export function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeFaq, setActiveFaq] = useState(null);

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "DONOR":
        return "/donor";
      case "NGO":
        return "/ngo/listings";
      case "VOLUNTEER":
        return "/volunteer/listings";
      case "ADMIN":
        return "/admin";
      default:
        return "/login";
    }
  };

  const faqs = [
    {
      q: "What types of food can be donated through Surplus?",
      a: "Commercial kitchens, restaurants, bakeries, and grocers can donate surplus cooked meals, fresh produce, packaged goods, baked items, and dairy products that meet local food safety and proper handling standards before expiry.",
    },
    {
      q: "How does the pickup and delivery SLA work?",
      a: "When a food listing is posted, donors specify an expiration and pickup window. Once claimed by a verified NGO or volunteer, an automated SLA deadline is calculated. Our dispatch system monitors pickup and delivery milestones in real time to ensure food is fresh upon handover.",
    },
    {
      q: "How is delivery verified?",
      a: "Every rescue mission concludes with a digital proof of distribution. Couriers capture and submit a handover photo along with beneficiary count and notes. Donors review and acknowledge this proof to close the transaction and receive impact credits.",
    },
    {
      q: "Is there any cost for NGOs or charitable food banks?",
      a: "No. Surplus is completely free for registered hunger-relief non-profits, community pantries, and certified volunteers. Our mission is to democratize food rescue and bridge the gap between waste and hunger.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ============================================================
          TOP ANNOUNCEMENT BANNER
      ============================================================ */}
      <div className="border-b border-emerald-500/20 bg-emerald-950/40 px-4 py-2.5 text-center text-xs font-medium text-emerald-300">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Over 24,000 kg of surplus food rescued across participating cities.</span>
          <a href="#impact" className="ml-1 underline underline-offset-2 hover:text-white">
            Explore live metrics &rarr;
          </a>
        </span>
      </div>

      {/* ============================================================
          NAVBAR
      ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Leaf className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                SURPLUS
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Food Rescue Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="transition hover:text-emerald-400">
              How It Works
            </a>
            <a href="#ecosystem" className="transition hover:text-emerald-400">
              Ecosystem
            </a>
            <a href="#impact" className="transition hover:text-emerald-400">
              Live Impact
            </a>
            <a href="#trust" className="transition hover:text-emerald-400">
              Safety & Verification
            </a>
            <a href="#faqs" className="transition hover:text-emerald-400">
              FAQs
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 right-0 -z-10 h-72 w-72 rounded-full bg-teal-500/10 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Food Rescue & Redistribution Network
          </div>

          {/* Headline */}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.12]">
            Turning Surplus Food Into Sustenance,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              Not Waste.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg sm:leading-8">
            Connect restaurants, commercial kitchens, and grocery stores directly with verified NGOs and volunteer couriers. Rapid spatial matching, automated SLA deadlines, and photo-verified distribution ensures food reaches hungry families before it expires.
          </p>

          {/* Role Choice Section */}
          <div className="mt-10 mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Choose your role to get started immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/register?role=DONOR"
                className="group relative flex flex-col items-center p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:bg-emerald-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/10 mb-2">
                  <Utensils className="h-5 w-5 text-slate-950" />
                </div>
                <span className="text-sm">I'm a Food Donor</span>
                <span className="text-[11px] font-normal text-slate-900/80 mt-0.5">Restaurants & grocers</span>
              </Link>

              <Link
                to="/register?role=NGO"
                className="group relative flex flex-col items-center p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 font-semibold backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-emerald-900/50 hover:border-emerald-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 mb-2 text-emerald-400">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <span className="text-sm">I'm an NGO / Food Bank</span>
                <span className="text-[11px] font-normal text-emerald-300/70 mt-0.5">Shelters & pantries</span>
              </Link>

              <Link
                to="/register?role=VOLUNTEER"
                className="group relative flex flex-col items-center p-4 rounded-2xl border border-teal-500/30 bg-teal-950/30 text-teal-200 font-semibold backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-teal-900/40 hover:border-teal-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 mb-2 text-teal-300">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm">I'm a Volunteer</span>
                <span className="text-[11px] font-normal text-teal-300/70 mt-0.5">Rescue couriers</span>
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
                Sign in to your dashboard &rarr;
              </Link>
            </p>
          </div>

          {/* Trust stats row */}
          <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="border-r border-white/5 pr-4 last:border-none">
                <p className="text-3xl font-black text-white sm:text-4xl">24,580</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Kg Food Diverted</p>
                <p className="mt-0.5 text-[11px] text-slate-500">From landfills</p>
              </div>

              <div className="border-r border-white/5 pr-4 last:border-none">
                <p className="text-3xl font-black text-white sm:text-4xl">49,160</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Nutritious Meals</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Served to communities</p>
              </div>

              <div className="border-r border-white/5 pr-4 last:border-none">
                <p className="text-3xl font-black text-white sm:text-4xl">98.6%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">On-Time SLA</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Reliable delivery</p>
              </div>

              <div>
                <p className="text-3xl font-black text-white sm:text-4xl">100%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Verified Proof</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Photo-audited handovers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS (4-STEP WORKFLOW)
      ============================================================ */}
      <section id="how-it-works" className="relative border-t border-white/5 py-24 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Seamless Lifecycle
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              How Surplus Rescues Food in Real Time
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
              An automated, audited pipeline connecting food donors with hunger-relief organizations in minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Utensils size={22} />
              </div>
              <span className="absolute top-6 right-6 text-3xl font-black text-slate-800">01</span>
              <h3 className="mt-6 text-lg font-bold text-white">Post Surplus Listing</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Commercial kitchens and outlets publish excess food with detailed quantities, storage temperature, dietary tags, and expiry timestamps.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MapPin size={22} />
              </div>
              <span className="absolute top-6 right-6 text-3xl font-black text-slate-800">02</span>
              <h3 className="mt-6 text-lg font-bold text-white">Spatial Claim & Match</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Nearby verified NGOs and community food banks are matched via PostGIS proximity algorithms and instantly claim the listing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Truck size={22} />
              </div>
              <span className="absolute top-6 right-6 text-3xl font-black text-slate-800">03</span>
              <h3 className="mt-6 text-lg font-bold text-white">SLA-Driven Dispatch</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Couriers confirm pickup at the outlet. Dynamic SLA timers enforce rapid transport so perishable food stays safe and edible.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Camera size={22} />
              </div>
              <span className="absolute top-6 right-6 text-3xl font-black text-slate-800">04</span>
              <h3 className="mt-6 text-lg font-bold text-white">Proof & Closure</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Couriers upload photo proof of distribution. Donors review and acknowledge, unlocking tax documentation, impact reports, and rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE THREE PILLAR ECOSYSTEM
      ============================================================ */}
      <section id="ecosystem" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              One Unified Network
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Built for Every Stakeholder
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
              Whether you provide surplus meals, distribute aid, or coordinate logistics, Surplus empowers your workflow.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Donors Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Building2 size={28} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Food Donors & Outlets</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Restaurants, caterers, hotels, supermarket chains, and corporate cafeterias.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Effortless multi-branch outlet management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Verified charity pickup with zero food liability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Live photo confirmation & ESG sustainability data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Corporate tax benefit & donation certificates
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link
                  to="/register?role=DONOR"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Start Donating As Business &rarr;
                </Link>
              </div>
            </div>

            {/* NGOs Card */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-950 p-8 shadow-xl relative">
              <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                High Impact
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <HeartHandshake size={28} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">NGOs & Hunger Relief</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Non-profits, homeless shelters, orphanages, and community distribution pantries.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Instant access to fresh, prepared commercial food
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Geographic distance alerts for nearby surplus batches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Transparent tracking from claim to final handover
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Community impact reports for grant funders
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link
                  to="/register?role=NGO"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Register Non-Profit &rarr;
                </Link>
              </div>
            </div>

            {/* Volunteers Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-400">
                <Users size={28} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Volunteer Rescuers</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Active community couriers, student drivers, and passionate zero-waste advocates.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Flexible pickup routes tailored to your schedule
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Mobile-friendly verification and proof photo upload
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Gamified eco-badges, rewards, and milestone points
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Direct, visible contribution to local neighborhoods
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link
                  to="/register?role=VOLUNTEER"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Join as Volunteer Courier &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          LIVE IMPACT METRICS
      ============================================================ */}
      <section id="impact" className="border-t border-white/5 bg-slate-900/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Environmental & Social Ledger
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-white">
                Tangible Planetary Impact
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/15"
            >
              View Detailed Metrics &rarr;
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <Leaf size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">61.4 Tons</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">CO2 Emissions Avoided</p>
              <p className="mt-1 text-[11px] text-slate-500">Methane prevention factor calculated per kg</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Globe size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">1.8M Liters</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Water Footprint Conserved</p>
              <p className="mt-1 text-[11px] text-slate-500">Virtual water saved in agriculture</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Users size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">12,400+</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Beneficiaries Fed</p>
              <p className="mt-1 text-[11px] text-slate-500">Documented in proof handovers</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Award size={20} />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">99.2%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Rate</p>
              <p className="mt-1 text-[11px] text-slate-500">Audit-backed distribution closed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST & SAFETY PILLARS
      ============================================================ */}
      <section id="trust" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={14} /> Enterprise Food Safety Standards
                </span>

                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  Rigorous Verification, Guaranteed Transparency
                </h2>

                <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                  Surplus was architected with strict governance to ensure that every food rescue complies with health codes and municipal donor protections:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Admin-Vetted Non-Profits</p>
                      <p className="text-xs text-slate-400">All claiming organizations must pass manual documentation audits before receiving pickup access.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Real-Time SLA Guardrails</p>
                      <p className="text-xs text-slate-400">Automated workers calculate precise transit windows and alert operators before any batch approaches safety thresholds.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Permanent Immutable Audit Logs</p>
                      <p className="text-xs text-slate-400">Every claim, transition, photo upload, and acknowledgment is permanently recorded for regulatory reporting.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Demonstration Credentials</p>
                <p className="mt-1 text-xs text-slate-400">Try any role instantly in your browser:</p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-white">Donor Portal:</span>
                      <span className="ml-2 font-mono text-emerald-400">donor@surplus.local</span>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">Password@123</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-white">NGO Portal:</span>
                      <span className="ml-2 font-mono text-emerald-400">ngo@surplus.local</span>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">Password@123</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-white">Volunteer Courier:</span>
                      <span className="ml-2 font-mono text-emerald-400">volunteer@surplus.local</span>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">Password@123</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-white">Admin Control:</span>
                      <span className="ml-2 font-mono text-emerald-400">admin@surplus.local</span>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">Password@123</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to="/login"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Demo Login
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/register"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Register New Account
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQS SECTION
      ============================================================ */}
      <section id="faqs" className="border-t border-white/5 bg-slate-900/40 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Got Questions?</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-emerald-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      activeFaq === index ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                {activeFaq === index && (
                  <div className="border-t border-white/5 p-5 text-xs text-slate-400 leading-relaxed bg-white/[0.01]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CALL TO ACTION FOOTER BANNER
      ============================================================ */}
      <section className="relative overflow-hidden py-20 border-t border-white/5">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-emerald-950/50 to-transparent" />
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-5xl">
            Ready to Rescue Food in Your Community?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
            Join hundreds of food providers and relief workers fighting waste and ending hunger today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register?role=DONOR"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400"
            >
              <Utensils className="h-4 w-4" />
              Register as Donor
            </Link>
            <Link
              to="/register?role=NGO"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
              Register as NGO / Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-white/5 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
              <Leaf size={14} />
            </div>
            <span className="font-bold text-white">SURPLUS Platform</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-slate-400">How It Works</a>
            <a href="#impact" className="hover:text-slate-400">Impact</a>
            <a href="#trust" className="hover:text-slate-400">Security</a>
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign Up</Link>
            <Link to="/login" className="hover:text-slate-400">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
