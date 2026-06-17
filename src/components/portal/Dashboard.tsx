/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  ChevronRight,
  FileText,
  Calendar,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  HelpCircle,
  Shield,
  Check,
  X,
} from "lucide-react";
import {
  AnalyticsSummary,
  QueryLog,
  User,
  ROLE_HIERARCHY,
  PendingApprovalRequest,
  PendingProfileRequest,
  PendingKickRequest,
} from "../../types";

interface DashboardProps {
  currentUser: User;
  onNavigateToChat: (initialQuery?: string) => void;
  companyName?: string;
}

interface SearchResult {
  documentId: string;
  documentName: string;
  section: string;
  snippet: string;
}

export default function Dashboard({ currentUser, onNavigateToChat, companyName }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [recentQueries, setRecentQueries] = useState<QueryLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalRequest[]>([]);
  const [pendingProfileRequests, setPendingProfileRequests] = useState<PendingProfileRequest[]>([]);
  const [pendingKickRequests, setPendingKickRequests] = useState<PendingKickRequest[]>([]);

  const fetchPendingApprovals = () => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      // 1. Core SSO clearances
      const approvalsStr = localStorage.getItem(`kb_portal_pending_approvals_${compKey}`);
      if (approvalsStr) {
        const approvals: PendingApprovalRequest[] = JSON.parse(approvalsStr);
        const eligible = approvals.filter((req) => {
          if (req.status !== "pending") return false;
          const myRank = ROLE_HIERARCHY[currentUser.role] || 0;
          const targetRank = ROLE_HIERARCHY[req.role] || 0;
          return currentUser.role === "Owner" ? true : myRank > targetRank;
        });
        setPendingApprovals(eligible);
      } else {
        setPendingApprovals([]);
      }

      // 2. Profile changes (requires higher supervisor/Owner)
      const profileStr = localStorage.getItem(`kb_portal_pending_profile_reqs_${compKey}`);
      if (profileStr) {
        const reqs: PendingProfileRequest[] = JSON.parse(profileStr);
        const eligible = reqs.filter((r) => {
          if (r.status !== "pending") return false;
          const myRank = ROLE_HIERARCHY[currentUser.role] || 0;
          const targetRank = ROLE_HIERARCHY[r.requestedByRole] || 0;
          return (
            currentUser.role === "Owner" ||
            myRank > targetRank ||
            r.sponsorName.toLowerCase() === currentUser.name.toLowerCase()
          );
        });
        setPendingProfileRequests(eligible);
      } else {
        setPendingProfileRequests([]);
      }

      // 3. Kick requests (Only visible/handled by Owner!)
      const kickStr = localStorage.getItem(`kb_portal_pending_kick_reqs_${compKey}`);
      if (kickStr) {
        const reqs: PendingKickRequest[] = JSON.parse(kickStr);
        const eligible = reqs.filter((r) => {
          if (r.status !== "pending") return false;
          return currentUser.role === "Owner";
        });
        setPendingKickRequests(eligible);
      } else {
        setPendingKickRequests([]);
      }
    } catch (err) {
      console.error("Failed to load approvals inside dashboard:", err);
    }
  };

  const handleApproveClearance = (reqId: string, name: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const approvalsStr = localStorage.getItem(`kb_portal_pending_approvals_${compKey}`);
      if (approvalsStr) {
        const approvals: PendingApprovalRequest[] = JSON.parse(approvalsStr);
        const requestIndex = approvals.findIndex((r) => r.id === reqId);
        if (requestIndex !== -1) {
          approvals[requestIndex].status = "approved";
          approvals[requestIndex].approvedBy = currentUser.name;
          localStorage.setItem(`kb_portal_pending_approvals_${compKey}`, JSON.stringify(approvals));

          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error approving clearance:", err);
    }
  };

  const handleRejectClearance = (reqId: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const approvalsStr = localStorage.getItem(`kb_portal_pending_approvals_${compKey}`);
      if (approvalsStr) {
        const approvals: PendingApprovalRequest[] = JSON.parse(approvalsStr);
        const requestIndex = approvals.findIndex((r) => r.id === reqId);
        if (requestIndex !== -1) {
          approvals[requestIndex].status = "rejected";
          approvals[requestIndex].approvedBy = currentUser.name;
          localStorage.setItem(`kb_portal_pending_approvals_${compKey}`, JSON.stringify(approvals));

          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error rejecting clearance:", err);
    }
  };

  const handleApproveProfileRequest = async (reqId: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const profileStr = localStorage.getItem(`kb_portal_pending_profile_reqs_${compKey}`);
      if (profileStr) {
        const reqs: PendingProfileRequest[] = JSON.parse(profileStr);
        const idx = reqs.findIndex((r) => r.id === reqId);
        if (idx !== -1) {
          const req = reqs[idx];
          req.status = "approved";
          req.approvedBy = currentUser.name;

          // 1. Overwrite user database in LocalStorage
          const dbStr = localStorage.getItem(`kb_portal_users_db_${compKey}`);
          if (dbStr) {
            const db = JSON.parse(dbStr);
            const oldKey = req.userName.toLowerCase().trim();
            const newKey = (req.requestedName || req.userName).toLowerCase().trim();

            if (db[oldKey]) {
              const oldRecord = db[oldKey];
              const updatedRecord = {
                ...oldRecord,
                name: req.requestedName || oldRecord.name,
                domain: req.requestedEmail.includes("@")
                  ? req.requestedEmail.split("@")[1]
                  : oldRecord.domain,
              };
              if (req.requestedPassword) {
                updatedRecord.password = req.requestedPassword;
              }
              if (oldKey !== newKey) {
                delete db[oldKey];
              }
              db[newKey] = updatedRecord;
              localStorage.setItem(`kb_portal_users_db_${compKey}`, JSON.stringify(db));
            }
          }

          // 2. Synchronize with the backend node.js database
          const finalName = req.requestedName || req.userName;
          const initials =
            finalName
              .split(" ")
              .map((n) => n[0])
              .filter(Boolean)
              .join("")
              .substring(0, 2)
              .toUpperCase() || "EE";

          await fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: req.userId,
              name: finalName,
              email: req.requestedEmail,
              role: req.requestedByRole,
              avatar: initials,
              password: req.requestedPassword,
              domain: req.requestedEmail.includes("@")
                ? req.requestedEmail.split("@")[1]
                : "enterprise.com",
              company: compKey,
            }),
          });

          localStorage.setItem(`kb_portal_pending_profile_reqs_${compKey}`, JSON.stringify(reqs));
          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error approving profile request:", err);
    }
  };

  const handleRejectProfileRequest = (reqId: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const profileStr = localStorage.getItem(`kb_portal_pending_profile_reqs_${compKey}`);
      if (profileStr) {
        const reqs: PendingProfileRequest[] = JSON.parse(profileStr);
        const idx = reqs.findIndex((r) => r.id === reqId);
        if (idx !== -1) {
          reqs[idx].status = "rejected";
          reqs[idx].approvedBy = currentUser.name;
          localStorage.setItem(`kb_portal_pending_profile_reqs_${compKey}`, JSON.stringify(reqs));
          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error rejecting profile update:", err);
    }
  };

  const handleApproveKickRequest = async (reqId: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const kickStr = localStorage.getItem(`kb_portal_pending_kick_reqs_${compKey}`);
      if (kickStr) {
        const reqs: PendingKickRequest[] = JSON.parse(kickStr);
        const idx = reqs.findIndex((r) => r.id === reqId);
        if (idx !== -1) {
          const req = reqs[idx];
          req.status = "approved";

          // 1. Kick on backend
          await fetch("/api/users/kick", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: req.targetUserId, company: compKey }),
          });

          // 2. Clear credentials in localStorage
          const dbStr = localStorage.getItem(`kb_portal_users_db_${compKey}`);
          if (dbStr) {
            const db = JSON.parse(dbStr);
            const userKey = req.targetUserName.toLowerCase();
            if (db[userKey]) {
              delete db[userKey];
              localStorage.setItem(`kb_portal_users_db_${compKey}`, JSON.stringify(db));
            }
          }

          // 3. Record as kicked to prevent auto-recreation
          const kickedStr = localStorage.getItem(`kb_portal_kicked_users_${compKey}`) || "[]";
          try {
            const kicked: string[] = JSON.parse(kickedStr);
            const targetKey = req.targetUserName.toLowerCase();
            if (!kicked.includes(targetKey)) {
              kicked.push(targetKey);
              localStorage.setItem(`kb_portal_kicked_users_${compKey}`, JSON.stringify(kicked));
            }
          } catch (e) {}

          localStorage.setItem(`kb_portal_pending_kick_reqs_${compKey}`, JSON.stringify(reqs));
          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error approving kick authorization:", err);
    }
  };

  const handleRejectKickRequest = (reqId: string) => {
    try {
      const compKey = (companyName || "ekaba").toLowerCase().trim();
      const kickStr = localStorage.getItem(`kb_portal_pending_kick_reqs_${compKey}`);
      if (kickStr) {
        const reqs: PendingKickRequest[] = JSON.parse(kickStr);
        const idx = reqs.findIndex((r) => r.id === reqId);
        if (idx !== -1) {
          reqs[idx].status = "rejected";
          localStorage.setItem(`kb_portal_pending_kick_reqs_${compKey}`, JSON.stringify(reqs));
          fetchPendingApprovals();
        }
      }
    } catch (err) {
      console.error("Error rejecting kick request:", err);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    const interval = setInterval(fetchPendingApprovals, 2500);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Load analytics and recent logs
  const fetchDashboardData = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }

      // Fetch simulated recent logs
      setRecentQueries([
        {
          id: "q-1",
          userId: "u-1",
          userName: "Pranav Jain",
          userRole: "IT Administrator",
          queryText: "What is the leave approval process for employees?",
          responseText:
            "Submit request through HRMS, requires Manager approval and HR verification.",
          citations: [{ sourceDoc: "Employee Handbook 2026", section: "Section 4.2" }],
          timestamp: "10 mins ago",
          status: "success",
          feedback: { rating: "like" },
        },
        {
          id: "q-2",
          userId: "u-2",
          userName: "Alice Smith",
          userRole: "Employee",
          queryText: "What is the travel meal limit allowance?",
          responseText:
            "Daily allowances are capped at $75 per day ($20 breakfast, $25 lunch, $30 dinner).",
          citations: [{ sourceDoc: "Employee Handbook 2026", section: "Section 5.1" }],
          timestamp: "1 hour ago",
          status: "success",
        },
        {
          id: "q-3",
          userId: "u-3",
          userName: "John Doe",
          userRole: "Manager",
          queryText: "What is the encryption requirement for SOC 2 compliance?",
          responseText:
            "Data must be encrypted at rest using AES-256 and in transit using TLS 1.3.",
          citations: [{ sourceDoc: "IT Security Guidelines", section: "Section 3.1" }],
          timestamp: "3 hours ago",
          status: "success",
          feedback: { rating: "like", comments: "Explanatory!" },
        },
      ]);
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Card with Live Nodes indicator */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] rounded-3xl p-6 md:p-8 text-white border border-amber-500/20 shadow-xl relative overflow-hidden">
        {/* Abstract background glowing amber orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-550/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Beautiful Blended Image Accent Card */}
        <div className="absolute top-0 right-0 bottom-0 w-1/3 opacity-15 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
            alt="Corporate Workspace Concept"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1c1917] via-[#1c1917]/50 to-transparent"></div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10 max-w-2xl">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl text-white shadow-lg shadow-amber-950/40">
            <Sparkles className="w-7 h-7 text-amber-100 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-amber-55 tracking-tight">
                Secure {companyName || "EKABA"} Portal: Welcome, {currentUser.name}!
              </h1>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30 px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">
                {currentUser.role}
              </span>
            </div>
            <p className="text-stone-300 text-xs mt-2 leading-relaxed">
              EKABA semantic artificial intelligence aggregates federated organizational material
              instantly and securely. Explore updated regulatory datasets, unified RAG querying
              hubs, and decentralized SSO approvals from this console.
            </p>
          </div>
        </div>

        {/* Live Cluster Nodes status widget */}
        <div className="flex items-center gap-3 bg-stone-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/15 shrink-0 w-full lg:w-auto relative z-10 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500 absolute left-[19px]"></div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              FIPS SSO Network Node
            </span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              Status: ACTIVE OVERSEER
            </span>
          </div>
        </div>
      </div>

      {/* Real-time SSO Clearance Notifications */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-subtle-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800">
                <Shield className="w-5 h-5 text-amber-700 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-850">
                  Authorization & Clearance Requests Pending
                </h4>
                <p className="text-[11px] text-stone-500">
                  The following newly routed users require your organizational hierarchy sign-off to
                  activate.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-amber-100 text-amber-900 text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-200 animate-pulse">
              {pendingApprovals.length} Clearance Required
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-stone-850">{req.name}</h5>
                      <span className="text-[10px] text-stone-400 font-mono tracking-wider block">
                        {req.domain}
                      </span>
                    </div>
                    <span className="text-[9px] bg-amber-55 border border-amber-250 font-mono text-amber-850 font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                      {req.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-505 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <span className="w-1 h-1 bg-stone-400 rounded-full"></span>
                    <span>
                      Requested Sponsoring:{" "}
                      <strong className="text-stone-700 font-mono">{req.sponsorName}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleRejectClearance(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-rose-200 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline Request</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveClearance(req.id, req.name)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#d97706] text-[10px] font-bold text-white hover:bg-amber-700 cursor-pointer transition shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Grant Clearance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Profile Security Clearance Notification */}
      {pendingProfileRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-subtle-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-805">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-850">
                  Profile Updates Sponsoring Requests
                </h4>
                <p className="text-[11px] text-stone-500">
                  The following users requested security clearance to change their credential
                  details (FIPS SSO).
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-amber-100 text-amber-900 text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-200 animate-pulse">
              {pendingProfileRequests.length} Profile Updates
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingProfileRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-stone-850">{req.userName}</h5>
                      <span className="text-[9px] text-amber-808 font-mono tracking-wider block bg-amber-55 px-1.5 py-0.5 rounded font-bold uppercase">
                        {req.requestedByRole}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px]/relaxed text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 space-y-1 font-mono">
                    <div className="truncate">
                      New Email:{" "}
                      <span className="text-stone-800 font-bold">{req.requestedEmail}</span>
                    </div>
                    {req.requestedPassword && (
                      <div>
                        New Password: <span className="text-stone-800 font-bold">••••••••</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleRejectProfileRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-rose-200 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveProfileRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#d97706] text-[10px] font-bold text-white hover:bg-amber-700 cursor-pointer transition shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner-only Real-time Kick Authorization Requests */}
      {currentUser.role === "Owner" && pendingKickRequests.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-subtle-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-850">
                <Users className="w-5 h-5 text-rose-750" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">Sponsoring Kick Authorizations</h4>
                <p className="text-[11px] text-rose-700">
                  Managers/HR supervisors require your absolute Owner clearance signature to remove
                  the following employee records.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-rose-100 text-rose-900 text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-rose-200 animate-pulse">
              {pendingKickRequests.length} Kick Clearances
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingKickRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-rose-200 hover:border-rose-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-rose-500 uppercase">
                      TARGET TO REMOVE:
                    </span>
                    <h5 className="text-xs font-bold text-stone-850">{req.targetUserName}</h5>
                    <span className="text-[9px] font-mono text-stone-400">
                      Position Role: {req.targetUserRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100 font-mono">
                    Requested by: <strong className="text-stone-800">{req.requestedBy}</strong> (
                    {req.requestedByRole})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleRejectKickRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-stone-200 text-[10px] font-bold text-stone-600 hover:bg-stone-50 cursor-pointer transition shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline Kick</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveKickRequest(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-rose-600 text-[10px] font-bold text-white hover:bg-rose-700 cursor-pointer transition shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize Kick</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Search and Sandbox, Right Quick Tools */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Search and Sandbox (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Search panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 transition-all hover:shadow-md">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block mb-1">
                Corporate Index Retrieval
              </span>
              <h3 className="text-md font-display font-bold text-slate-900">
                Execute Semantic Search Query
              </h3>
              <p className="text-slate-500 text-xs">
                Matches questions and compliance files against vectors mapped in the secure sandbox
                directory.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ask a question (e.g., 'What is the leave approval process for employees?')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-250 focus:border-amber-600 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-905 focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="bg-[#1c1917] hover:bg-[#2b2721] disabled:opacity-50 text-white rounded-xl py-3 px-5 text-xs font-bold font-sans tracking-wide transition-all shadow-sm shadow-stone-200 flex items-center gap-1.5 cursor-pointer animate-none"
              >
                {searching ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Chunks...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Submit Query</span>
                  </>
                )}
              </button>
            </form>

            {/* Search Results Drawer */}
            {searchResults !== null && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-mono font-bold text-slate-505 uppercase tracking-wide">
                    Vector Database Matches ({searchResults.length} references)
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold transition hover:underline"
                  >
                    Dismiss results
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-805 text-xs">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                    <span>
                      No document fragments found matching this pattern. Fire up conversational
                      model below to synthesize.
                    </span>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {searchResults.map((result, idx) => {
                      return (
                        <div
                          key={idx}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-all duration-150 relative overflow-hidden group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-stone-100 text-stone-700 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-700 truncate block">
                                {result.documentName}
                              </span>
                              <span className="text-[9px] font-mono text-amber-808 uppercase tracking-widest font-bold">
                                {result.section}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-650 text-xs leading-relaxed italic line-clamp-3 bg-white/80 p-2 rounded-lg border border-slate-150">
                            &ldquo;{result.snippet}&rdquo;
                          </p>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() =>
                                onNavigateToChat(`Search details about "${result.section}"`)
                              }
                              className="text-[11px] text-stone-850 hover:text-amber-850 font-bold inline-flex items-center gap-1 hover:underline"
                            >
                              <span>Synthesize Answer</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Interactive Guided Prompts Sandbox (Visual Facelift Addition) */}
          <div className="bg-slate-100/60 border border-slate-205 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-amber-700 animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-800">
                  Quick-Launch Guided Prompts
                </h4>
              </div>
              <p className="text-slate-505 text-xs mt-0.5">
                Explore standard compliance structures by clicking any pre-approved organizational
                prompt below:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              {[
                {
                  title: "Travel & Expense Allotments",
                  role: "All Roles",
                  icon: "plane",
                  query: "What is the travel meal limit allowance?",
                  bg: "border-stone-200 hover:bg-stone-50",
                  text: "Allows employees to understand per-diem criteria and daily cap bounds.",
                },
                {
                  title: "Approval Chains & Leaves",
                  role: "Managers & HR",
                  icon: "calendar",
                  query: "What processes do I follow for leave approval?",
                  bg: "border-stone-200 hover:bg-stone-55",
                  text: "Clarifies HRMS submissions, manager authorization nodes, and timing specs.",
                },
                {
                  title: "Physical & Network Cryptography",
                  role: "IT & Admin",
                  icon: "lock",
                  query: "What encryption standards are specified for GDPR?",
                  bg: "border-stone-200 hover:bg-stone-50",
                  text: "Inspect rules detailing static rest storage and secure flight TLS encryption.",
                },
                {
                  title: "General Code of Conduct",
                  role: "Staff Team",
                  icon: "users",
                  query:
                    "What guidelines are specified for conflict resolution in team project audits?",
                  bg: "border-stone-200 hover:bg-stone-50",
                  text: "Standard procedures for handling project milestones and workflow disputes.",
                },
              ].map((act, index) => (
                <div
                  key={index}
                  onClick={() => onNavigateToChat(act.query)}
                  className={`bg-white border rounded-xl p-3.5 hover:shadow-sm cursor-pointer transition-all duration-200 text-left ${act.bg} group flex flex-col justify-between`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800 transition-colors">
                        {act.title}
                      </span>
                      <span className="text-[8px] bg-slate-100 text-slate-500 font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-slate-200">
                        {act.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{act.text}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono group-hover:text-amber-700 font-bold transition-colors">
                    <span>Execute Sandbox</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dashboard Sidebar Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Knowledge Assets Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-display font-bold text-slate-850 text-sm">
                Corporate Access Scope
              </h4>
              <p className="text-[11px] text-slate-400">
                Current active credential context settings
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-start gap-3">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block">Single-Sign-On Verified</span>
                  <p className="text-slate-500 leading-relaxed mt-0.5">
                    Role segmented authentication rules are enforced dynamically.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-start gap-3">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block">
                    Conversational LLM Integration
                  </span>
                  <p className="text-slate-505 leading-relaxed mt-0.5">
                    Gemini 3.5 secure models extract relevant citations with robust audit logging.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => onNavigateToChat()}
                className="w-full bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3 px-4 text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Go to Conversational Agent</span>
              </button>
            </div>
          </div>

          {/* New Interactive Concept Visualization Graphic with modern glass office imagery */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                alt="AI Semantic Federated Workspace"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-amber-600/95 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                Active Cluster: Gemini-3.5
              </div>
            </div>
            <div className="p-4.5 space-y-1">
              <h5 className="text-xs font-bold text-slate-850 font-sans">
                Federated Knowledge Workspace
              </h5>
              <p className="text-[11px] text-slate-505 leading-normal">
                Visualizing multi-dimensional coordinate embeddings safely registered inside the
                secure corporate workspace.
              </p>
            </div>
          </div>

          {/* Secure Workspace Rules Alert */}
          <div className="bg-gradient-to-br from-[#FAF6ED] to-amber-50/20 border border-amber-200 p-5 rounded-2xl shadow-inner space-y-2.5">
            <h5 className="text-xs font-bold text-amber-900 tracking-wide uppercase font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-700" />
              <span>Vector Database Ingestion</span>
            </h5>
            <p className="text-[11px] text-stone-800 leading-relaxed">
              New business files, policy updates, and manual fragments are seamlessly converted to
              dense embeddings vectors immediately upon being uploaded. Run searches or ask queries
              to verify cataloged indices.
            </p>
          </div>
        </div>
      </div>

      {loadingAnalytics || !analytics ? (
        <div className="grid md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-28 bg-slate-205 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 transition hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">ACTIVE USERS</span>
                <div className="p-1.5 bg-stone-100 text-stone-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-900">
                {analytics.activeUsers}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">SEAMLESS LOGINS TODAY</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-205 p-5 shadow-sm space-y-2 transition hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">SEARCH SUCCESS</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-900">
                {analytics.searchSuccessRate}%
              </div>
              {/* Mini visual success metric progress bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${analytics.searchSuccessRate}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Target Accuracy Achieved
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 transition hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">QUERY VOLUME</span>
                <div className="p-1.5 bg-stone-100 text-stone-700 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-900">
                {analytics.queryVolume}
              </div>
              <p className="text-[10px] text-slate-505 font-mono">TOTAL CONVERSATIONS LOGGED</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 transition hover:shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">SATISFACTION INDEX</span>
                <div className="p-1.5 bg-amber-55 text-amber-550 rounded-lg">
                  <ThumbsUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-900">
                {analytics.userSatisfaction}%
              </div>
              {/* Mini visual sentiment bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-550"
                  style={{ width: `${analytics.userSatisfaction}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-550 font-mono uppercase">User Approval Rate</p>
            </div>
          </div>

          {/* Visual SVG Analytics Charts */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Daily Usage Bar Chart */}
            <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 transition hover:shadow-md">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-md">
                    Daily System Volume
                  </h3>
                  <p className="text-xs text-slate-400">
                    Query traffic metrics in the past calendar week
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 font-mono uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 animate-none">
                  <TrendingUp className="w-3 h-3 text-amber-700" />
                  <span>Up 12% vs last week</span>
                </div>
              </div>

              {/* Advanced SVG Bar Chart with subtle gradients and drop shadows */}
              <div className="w-full h-56 flex items-end justify-between px-2 pt-4 relative">
                {/* Horizontal grid guide lines */}
                <div className="absolute inset-x-0 bottom-4 border-b border-slate-100 font-sans"></div>
                <div className="absolute inset-x-0 bottom-16 border-b border-slate-100/50"></div>
                <div className="absolute inset-x-0 bottom-28 border-b border-slate-100/50"></div>
                <div className="absolute inset-x-0 bottom-40 border-b border-slate-100/30"></div>

                {analytics.dailyUsage.map((day, dIdx) => {
                  const maxCount = Math.max(...analytics.dailyUsage.map((d) => d.count), 1);
                  const barHeightPercent = (day.count / maxCount) * 85; // max height to fit text nicely

                  return (
                    <div
                      key={dIdx}
                      className="flex-1 flex flex-col items-center group relative z-10 space-y-2"
                    >
                      <div
                        className="relative w-10 sm:w-12 bg-stone-55 hover:bg-amber-50 rounded-t-lg transition-all duration-300 flex items-end justify-center"
                        style={{ height: `${Math.max(barHeightPercent, 10)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 block absolute -top-8 bg-slate-900 text-white rounded text-[10px] px-2 py-0.5 whitespace-nowrap transition-all shadow font-mono font-bold z-20">
                          {day.count} queries
                        </span>
                        {/* Interactive inner gradients */}
                        <div className="w-full h-full bg-gradient-to-t from-[#1c1917] to-stone-700 hover:from-stone-900 hover:to-amber-600 rounded-t-lg transition-all shadow-inner"></div>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold font-mono">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Searched Topics */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 transition hover:shadow-md">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-md">
                  Top Searched Topics
                </h3>
                <p className="text-xs text-slate-400">Most queried terms & compliance documents</p>
              </div>

              <div className="space-y-4.5 pt-2">
                {analytics.topSearchedTopics.map((topic, tIdx) => {
                  const maxSearchCount = Math.max(
                    ...analytics.topSearchedTopics.map((t) => t.count),
                    1,
                  );
                  const itemWidthPercent = (topic.count / maxSearchCount) * 100;

                  return (
                    <div key={tIdx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span className="font-bold">{topic.topic}</span>
                        <span className="text-slate-400 font-mono">{topic.count} hits</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1c1917] to-amber-600 rounded-full transition-all duration-500"
                          style={{ width: `${itemWidthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Auditable Queries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-4 gap-2">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-md">
                  Recent Auditable Queries
                </h3>
                <p className="text-xs text-slate-400">
                  Secure, role-based real-time request log histories
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-lg px-3 py-2 inline-flex items-center gap-1.5 font-bold cursor-pointer transition shadow-sm shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Logs Channel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                    <th className="py-2.5 pb-3">User & Access Role</th>
                    <th className="py-2.5 pb-3">Request Text</th>
                    <th className="py-2.5 pb-3">Response Preview</th>
                    <th className="py-2.5 pb-3">Source Citation</th>
                    <th className="py-2.5 pb-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {recentQueries.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 pr-2 font-medium">
                        <div className="font-bold text-slate-800">{log.userName}</div>
                        <div className="text-[10px] font-bold text-slate-405 font-mono tracking-wide">
                          {log.userRole}
                        </div>
                      </td>
                      <td
                        className="py-3.5 pr-2 max-w-[200px] sm:max-w-xs truncate font-medium text-slate-700"
                        title={log.queryText}
                      >
                        {log.queryText}
                      </td>
                      <td className="py-3.5 pr-2 max-w-[200px] sm:max-w-xs truncate text-[11px] text-slate-500 font-sans">
                        {log.responseText}
                      </td>
                      <td className="py-3.5 pr-2 font-mono text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                        {log.citations && log.citations.length > 0
                          ? log.citations[0].sourceDoc
                          : "None"}
                      </td>
                      <td className="py-3.5 text-right">
                        {log.feedback?.rating === "like" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono border border-emerald-100">
                            APPROVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold font-mono border border-slate-200">
                            PENDING_AUDIT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
