import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ShieldAlert,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  Building2,
  Truck,
  HeartHandshake,
  Activity,
  ShieldCheck,
  Package,
  Layers,
  Eye,
  Check,
  X,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { api } from "../../services/api";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");

  const [txStatusFilter, setTxStatusFilter] = useState("ALL");
  const [txSearch, setTxSearch] = useState("");

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const [impactRes, disputesRes, usersRes, txRes, auditRes] = await Promise.all([
        api.get("/impact/global").catch(() => ({ data: {} })),
        api.get("/admin/disputes").catch(() => ({ data: [] })),
        api.get("/admin/users").catch(() => ({ data: [] })),
        api.get("/admin/transactions").catch(() => ({ data: [] })),
        api.get("/admin/audit-logs").catch(() => ({ data: [] })),
      ]);

      setMetrics(impactRes.data || {});
      setDisputes(disputesRes.data || []);
      setUsers(usersRes.data || []);
      setTransactions(txRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load admin management data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerify = async (userId, status) => {
    setError("");
    setSuccessMessage("");
    try {
      await api.put(`/admin/users/${userId}/verify`, { status });
      setSuccessMessage(`User status updated to ${status}.`);
      await loadData(true);
    } catch (err) {
      setError(err?.message || "Failed to update user verification.");
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!resolvingDispute) return;
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.put(`/admin/disputes/${resolvingDispute.id}/resolve`, {
        resolution: resolutionText.trim() || "Resolved following administrative arbitration.",
      });
      setSuccessMessage("Dispute resolved successfully.");
      setResolvingDispute(null);
      setResolutionText("");
      await loadData(true);
    } catch (err) {
      setError(err?.message || "Failed to resolve dispute.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const orgName =
        u.donorProfile?.organizationName ||
        u.ngoProfile?.organizationName ||
        u.volunteerProfile?.fullName ||
        "";
      const matchesSearch =
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        orgName.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesStatus =
        userStatusFilter === "ALL" || u.verificationStatus === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const title = t.listing?.title || "";
      const id = t.id || "";
      const matchesSearch =
        title.toLowerCase().includes(txSearch.toLowerCase()) ||
        id.toLowerCase().includes(txSearch.toLowerCase());
      const matchesStatus =
        txStatusFilter === "ALL" || t.status === txStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, txSearch, txStatusFilter]);

  const pendingUsersCount = users.filter((u) => u.verificationStatus === "PENDING").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN").length;
  const overdueTxCount = transactions.filter((t) => t.slaStatus === "OVERDUE").length;

  return (
    <DashboardLayout title="Admin Control Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              System Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Platform Governance & Operations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              User verifications, conflict arbitration, live SLA monitoring, and security audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "overview", label: "Overview & Impact", icon: Activity },
            {
              id: "users",
              label: "User Verification",
              icon: Users,
              badge: pendingUsersCount > 0 ? pendingUsersCount : null,
              badgeColor: "bg-amber-500 text-white",
            },
            {
              id: "disputes",
              label: "Dispute Arbitration",
              icon: ShieldAlert,
              badge: openDisputesCount > 0 ? openDisputesCount : null,
              badgeColor: "bg-red-500 text-white",
            },
            {
              id: "transactions",
              label: "Transactions & SLA",
              icon: Truck,
              badge: overdueTxCount > 0 ? `${overdueTxCount} overdue` : null,
              badgeColor: "bg-red-100 text-red-700",
            },
            { id: "audit", label: "Audit & Security Logs", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW & IMPACT
        ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Registered Users
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {users.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {users.filter((u) => u.role === "DONOR").length} Donors • {users.filter((u) => u.role === "NGO").length} NGOs • {users.filter((u) => u.role === "VOLUNTEER").length} Volunteers
                </p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Listings
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {metrics?.activeListingsCount ?? transactions.filter((t) => t.status === "ACTIVE").length}
                </p>
                <p className="mt-1 text-xs text-slate-500">Available for rescue claim</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Completed Rescues
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {transactions.filter((t) => t.status === "CLOSED").length}
                </p>
                <p className="mt-1 text-xs text-slate-500">Photo-verified and closed</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  SLA Alerts / Overdue
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {overdueTxCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {transactions.filter((t) => t.slaStatus === "WARNING").length} in warning state
                </p>
              </Card>
            </div>

            {/* Quick summaries */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Pending Verifications Widget */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-amber-500 h-5 w-5" />
                    <h2 className="text-base font-bold text-slate-900">
                      Pending Verifications ({pendingUsersCount})
                    </h2>
                  </div>
                  {pendingUsersCount > 0 && (
                    <button
                      onClick={() => {
                        setUserStatusFilter("PENDING");
                        setActiveTab("users");
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>

                {pendingUsersCount === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    All user accounts are verified. No pending approvals.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {users
                      .filter((u) => u.verificationStatus === "PENDING")
                      .slice(0, 4)
                      .map((user) => {
                        const org =
                          user.donorProfile?.organizationName ||
                          user.ngoProfile?.organizationName ||
                          user.volunteerProfile?.fullName ||
                          "Unnamed Entity";
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {org}
                              </p>
                              <p className="text-xs text-slate-500">
                                {user.email} • <span className="font-semibold text-slate-700">{user.role}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => handleVerify(user.id, "REJECTED")}
                                className="text-xs px-2.5 py-1.5"
                              >
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleVerify(user.id, "VERIFIED")}
                                className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </Card>

              {/* Open Disputes Widget */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="text-red-500 h-5 w-5" />
                    <h2 className="text-base font-bold text-slate-900">
                      Open Disputes ({openDisputesCount})
                    </h2>
                  </div>
                  {openDisputesCount > 0 && (
                    <button
                      onClick={() => setActiveTab("disputes")}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>

                {openDisputesCount === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    No active disputes. System operations normal.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {disputes
                      .filter((d) => d.status === "OPEN")
                      .slice(0, 4)
                      .map((dispute) => (
                        <div
                          key={dispute.id}
                          className="flex items-center justify-between p-3.5 border border-red-100 bg-red-50/40 rounded-xl"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Tx #{dispute.transactionId?.substring(0, 8)}
                            </p>
                            <p className="text-xs text-red-700">
                              Reason: {dispute.reason}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setResolvingDispute(dispute);
                              setActiveTab("disputes");
                            }}
                            className="text-xs px-3 py-1.5"
                          >
                            Resolve
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: USER VERIFICATION & DIRECTORY
        ======================================================== */}
        {activeTab === "users" && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by email, contact, or organization..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Roles */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["ALL", "DONOR", "NGO", "VOLUNTEER", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
                      userRoleFilter === r
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Verification status */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["ALL", "PENDING", "VERIFIED", "REJECTED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserStatusFilter(s)}
                    className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
                      userStatusFilter === s
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Entity / Contact</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Details</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500">
                          No users match the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const org =
                          user.donorProfile?.organizationName ||
                          user.ngoProfile?.organizationName ||
                          user.volunteerProfile?.fullName ||
                          "Individual";
                        const phone =
                          user.donorProfile?.phone ||
                          user.ngoProfile?.phone ||
                          user.volunteerProfile?.phone ||
                          "—";
                        const extra =
                          user.ngoProfile?.beneficiaryCount
                            ? `${user.ngoProfile.beneficiaryCount} beneficiaries`
                            : user.volunteerProfile?.vehicleType
                            ? `Vehicle: ${user.volunteerProfile.vehicleType}`
                            : user.donorProfile?.address || "—";

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{org}</p>
                              <p className="text-slate-500">{user.email}</p>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 font-bold text-slate-700">
                                {user.role}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600">
                              <p>{phone}</p>
                              <p className="text-[11px] text-slate-400">{extra}</p>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 font-bold ${
                                  user.verificationStatus === "VERIFIED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : user.verificationStatus === "PENDING"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {user.verificationStatus}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-500">
                              {formatDate(user.createdAt)}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {user.verificationStatus !== "VERIFIED" && (
                                  <Button
                                    onClick={() => handleVerify(user.id, "VERIFIED")}
                                    className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <Check size={13} />
                                    Verify
                                  </Button>
                                )}

                                {user.verificationStatus !== "REJECTED" && (
                                  <Button
                                    variant="secondary"
                                    onClick={() => handleVerify(user.id, "REJECTED")}
                                    className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                                  >
                                    <X size={13} />
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: DISPUTE ARBITRATION
        ======================================================== */}
        {activeTab === "disputes" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">Open Disputes</p>
                <p className="mt-1 text-2xl font-black text-red-900">{openDisputesCount}</p>
                <p className="mt-0.5 text-xs text-red-600">Awaiting administrative mediation</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved Cases</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">
                  {disputes.filter((d) => d.status === "RESOLVED").length}
                </p>
                <p className="mt-0.5 text-xs text-emerald-600">Settled with documented arbitration</p>
              </div>
            </div>

            {disputes.length === 0 ? (
              <Card className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-3 text-base font-bold text-slate-900">Zero Disputes Reported</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  All transactions and food handovers are operating in harmony.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 p-5 gap-3 bg-slate-50/40">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            dispute.status === "OPEN"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {dispute.status}
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          Dispute ID: {dispute.id.slice(0, 8)}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        Filed on {formatDate(dispute.createdAt)}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Reason / Grievance
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {dispute.reason}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400">Opened By: </span>
                          <span className="font-medium text-slate-800">
                            {dispute.openedBy?.email} ({dispute.openedBy?.role})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400">Transaction ID: </span>
                          <span className="font-mono text-slate-800">
                            {dispute.transactionId}
                          </span>
                        </div>
                      </div>

                      {dispute.status === "RESOLVED" && (
                        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Resolved on {formatDate(dispute.resolvedAt)} by {dispute.resolvedBy?.email || "Admin"}
                          </p>
                          <p className="mt-1 text-emerald-800">
                            "{dispute.resolution}"
                          </p>
                        </div>
                      )}

                      {dispute.status === "OPEN" && (
                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                          <Button
                            onClick={() => {
                              setResolvingDispute(dispute);
                              setResolutionText("");
                            }}
                            className="bg-slate-900 text-white text-xs"
                          >
                            <MessageSquare size={14} />
                            Arbitrate & Resolve Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: TRANSACTIONS & SLA MONITORING
        ======================================================== */}
        {activeTab === "transactions" && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by listing name or transaction ID..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["ALL", "ACTIVE", "DELIVERED", "CLOSED", "CANCELLED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTxStatusFilter(s)}
                    className={`rounded-lg px-2.5 py-1.5 font-semibold transition ${
                      txStatusFilter === s
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Transaction / Listing</th>
                      <th className="py-3.5 px-4">Donor Outlet</th>
                      <th className="py-3.5 px-4">Claimant</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">SLA Deadline</th>
                      <th className="py-3.5 px-4">Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500">
                          No transactions found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const listing = tx.listing;
                        const outlet = listing?.outlet;
                        const claimant = tx.claim?.claimant;
                        const claimantName =
                          claimant?.ngoProfile?.organizationName ||
                          claimant?.volunteerProfile?.fullName ||
                          claimant?.email ||
                          "—";

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">
                                {listing?.title || "Food Listing"}
                              </p>
                              <p className="font-mono text-[11px] text-slate-400">
                                #{tx.id.slice(0, 8)} • {listing?.quantity} {listing?.unit}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="font-medium text-slate-800">
                                {outlet?.name || "Main Outlet"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {outlet?.donor?.organizationName || "Donor"}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="font-medium text-slate-800">{claimantName}</p>
                              <p className="text-[11px] text-slate-400">{claimant?.role || ""}</p>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 font-bold ${
                                  tx.status === "CLOSED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : tx.status === "DELIVERED"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  tx.slaStatus === "ON_TRACK"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : tx.slaStatus === "WARNING"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {tx.slaStatus || "ON_TRACK"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {tx.proof ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                  <CheckCircle2 size={13} /> Uploaded
                                </span>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: AUDIT LOGS & SECURITY
        ======================================================== */}
        {activeTab === "audit" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Immutable Platform Audit Ledger
                </h2>
                <p className="text-xs text-slate-500">
                  Cryptographically trackable system actions recorded for regulatory compliance.
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Displaying last {auditLogs.length} events
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Actor ID</th>
                      <th className="py-3.5 px-4">Target Entity</th>
                      <th className="py-3.5 px-4">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 font-sans text-xs">
                          No audit entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-slate-500 font-sans text-xs">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded bg-slate-900 text-emerald-400 px-2 py-0.5 font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {log.actorId ? log.actorId.slice(0, 10) + "..." : "SYSTEM"}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {log.entityType} ({log.entityId ? log.entityId.slice(0, 8) + "..." : "—"})
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {log.metadata ? JSON.stringify(log.metadata) : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Resolution Modal */}
        {resolvingDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Resolve Dispute #{resolvingDispute.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide arbitration outcome and closing statement.
                  </p>
                </div>
                <button
                  onClick={() => setResolvingDispute(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResolveDispute} className="p-6 space-y-4">
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <span className="font-bold">Original Grievance: </span>
                  {resolvingDispute.reason}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Arbitration Findings & Resolution Notes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="e.g. Verified with outlet manager that delivery was completed within acceptable tolerance..."
                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setResolvingDispute(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Confirm Resolution
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
