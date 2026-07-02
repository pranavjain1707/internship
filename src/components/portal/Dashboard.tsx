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
  Lock,
  Clock,
  Building2,
} from "lucide-react";
import {
  AnalyticsSummary,
  QueryLog,
  User,
  ROLE_HIERARCHY,
  PendingApprovalRequest,
  PendingProfileRequest,
  PendingKickRequest,
  DemoRequest,
} from "../../types";
import { logUserActivity } from "../../lib/activity-client";

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

const formatCompanyName = (name?: string) => {
  if (!name) return "EKABA";
  const normalized = name.trim().toLowerCase();
  if (normalized === "ekaba" || normalized === "ekaba internal") return "EKABA";
  if (normalized === "acme corp" || normalized === "acme") return "Acme Corp";
  if (normalized === "google" || normalized === "microsoft" || normalized === "apple") {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function VectorSpace3D() {
  const [rotation, setRotation] = useState({ x: 15, y: 45 });
  const [queryActive, setQueryActive] = useState(false);
  const [nodes, setNodes] = useState<{x: number, y: number, z: number, label: string}[]>([]);

  useEffect(() => {
    // Generate simulated document embedding vectors
    const docs = [
      { x: -50, y: 40, z: -30, label: "HR_Handbook.pdf" },
      { x: 60, y: -30, z: 50, label: "Security_Audit.docx" },
      { x: -30, y: -70, z: 40, label: "Travel_Policy.pdf" },
      { x: 40, y: 60, z: -50, label: "GDPR_Rules.pdf" },
      { x: 20, y: -20, z: -20, label: "Code_of_Conduct.docx" }
    ];
    setNodes(docs);

    // Auto rotate
    const timer = setInterval(() => {
      setRotation(prev => ({
        x: (prev.x + 0.2) % 360,
        y: (prev.y + 0.3) % 360
      }));
    }, 40);

    // Periodic search pulse simulation
    const pulseTimer = setInterval(() => {
      setQueryActive(true);
      setTimeout(() => setQueryActive(false), 1200);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(pulseTimer);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] bg-[#0b0e14] rounded-2xl border border-slate-800/80 overflow-hidden font-mono shadow-2xl p-4 flex flex-col justify-between">
      {/* Gloss overlay */}
      <div className="screen-gloss" />
      <div className="scan-line" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 relative z-10 text-left">
        <div className="flex items-center gap-1.5 text-[8px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>sem-vector-space-3d</span>
        </div>
        <span className="text-[8px] font-bold text-amber-500/80 tracking-widest uppercase">
          {queryActive ? "SCANNING VECTORS" : "IDLE / ROTATING"}
        </span>
      </div>

      {/* 3D Space Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Isometric grid floor */}
        <div 
          className="absolute w-44 h-44 border border-slate-800/30 rounded-full"
          style={{
            transform: `rotateX(65deg) rotateZ(${rotation.y}deg)`,
            backgroundImage: "radial-gradient(circle, transparent 30%, oklch(0.86 0.18 120 / 3%) 70%)",
            transition: "transform 0.1s linear"
          }}
        />

        {/* Query Vector Projector Line */}
        {queryActive && (
          <div 
            className="absolute h-24 w-[1.5px] bg-gradient-to-t from-transparent via-amber-500 to-amber-300 origin-bottom animate-pulse"
            style={{
              transform: `rotateX(30deg) rotateY(${rotation.y}deg)`,
              boxShadow: "0 0 12px oklch(0.86 0.18 120 / 30%)"
            }}
          />
        )}

        {/* Embedding Nodes */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `perspective(500px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.1s linear"
          }}
        >
          {nodes.map((node, i) => {
            const isTarget = queryActive && i === (rotation.x > 180 ? 1 : 0);
            return (
              <div
                key={node.label}
                className="absolute flex flex-col items-center"
                style={{
                  transform: `translate3d(${node.x}px, ${node.y}px, ${node.z}px)`,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Node Orb */}
                <div 
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 relative ${
                    isTarget 
                      ? "bg-amber-400 scale-[1.75] shadow-lg shadow-amber-500/50" 
                      : "bg-primary/70"
                  }`}
                />
                
                {/* Connecting lines to origin */}
                <div className="h-[1px] w-10 bg-slate-800/40 origin-left" style={{ transform: "rotateY(90deg)" }} />

                {/* Node label */}
                <span className={`text-[7px] mt-1 whitespace-nowrap bg-slate-950/80 px-1 py-0.5 rounded border ${
                  isTarget ? "border-amber-500 text-amber-300 animate-pulse" : "border-slate-800/80 text-slate-500"
                }`}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="flex justify-between items-center text-[7px] text-slate-500 pt-2 border-t border-slate-800/60 relative z-10">
        <span>DIMENSIONS: 1536</span>
        <span>PROJ: ISOMETRIC</span>
      </div>
    </div>
  );
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

  // Demo requests states
  const [demoReqList, setDemoReqList] = useState<DemoRequest[]>([]);
  const [ekabaEmployees, setEkabaEmployees] = useState<User[]>([]);
  const [authorizedCompanies, setAuthorizedCompanies] = useState<Record<string, any>>({});
  
  // Active plan selection state
  const [activePlanSelector, setActivePlanSelector] = useState<Record<string, boolean>>({});

  // Download Requests State
  interface DownloadRequest {
    id: string;
    documentId: string;
    documentName: string;
    requestedBy: string;
    requestedByRole: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  }
  const [downloadRequests, setDownloadRequests] = useState<DownloadRequest[]>([]);

  const fetchDownloadRequests = () => {
    const compKey = (companyName || "ekaba").trim().toLowerCase();
    const str = localStorage.getItem(`kb_portal_download_requests_${compKey}`);
    if (str) {
      try {
        setDownloadRequests(JSON.parse(str));
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchDownloadRequests();
    const interval = setInterval(fetchDownloadRequests, 2000);
    return () => clearInterval(interval);
  }, [companyName]);

  const handleApproveDownload = (reqId: string, status: "approved" | "rejected") => {
    const compKey = (companyName || "ekaba").trim().toLowerCase();
    const updated = downloadRequests.map((req) => {
      if (req.id === reqId) {
        return { ...req, status };
      }
      return req;
    });
    localStorage.setItem(`kb_portal_download_requests_${compKey}`, JSON.stringify(updated));
    setDownloadRequests(updated);
    logUserActivity(
      currentUser.id,
      currentUser.name,
      `${status === "approved" ? "Approved" : "Rejected"} download request for document`
    );
  };

  const handleStartPlan = async (clientCompany: string, months: number) => {
    try {
      const res = await fetch("/api/authorized-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: clientCompany,
          planMonths: months,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
        }),
      });

      if (res.ok) {
        await fetchAuthorizedCompanies();
        logUserActivity(
          currentUser.id,
          currentUser.name,
          `Started a ${months}-month subscription plan for ${clientCompany}`
        );
      }
    } catch (err) {
      console.error("Failed to start plan:", err);
    }
  };

  const fetchDemoRequests = async () => {
    try {
      const res = await fetch("/api/demo-request");
      if (res.ok) {
        const data = await res.json();
        setDemoReqList(data);
      }
    } catch (err) {
      console.error("Failed to fetch demo requests:", err);
    }
  };

  const fetchAuthorizedCompanies = async () => {
    try {
      const res = await fetch("/api/authorized-companies");
      if (res.ok) {
        const data = await res.json();
        setAuthorizedCompanies(data);
      }
    } catch (err) {
      console.error("Failed to fetch authorized companies:", err);
    }
  };

  const fetchEkabaEmployees = async () => {
    try {
      const res = await fetch("/api/users?company=ekaba");
      if (res.ok) {
        const data = await res.json();
        setEkabaEmployees(data.filter((u: User) => u.role !== "Owner"));
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleCreateAuthorizedId = async (req: DemoRequest) => {
    try {
      const compPrefix = req.company.replace(/\s+/g, "").substring(0, 4).toUpperCase();
      const randomNum = Math.floor(10 + Math.random() * 90);
      const generatedId = `${compPrefix}-EKABA-${randomNum}`;

      const res = await fetch("/api/authorized-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: req.company,
          authorizedClientId: generatedId,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          employeeEmail: currentUser.email,
        }),
      });

      if (res.ok) {
        await fetchAuthorizedCompanies();
        logUserActivity(
          currentUser.id,
          currentUser.name,
          `Generated authorized client ID ${generatedId} for company ${req.company}`
        );
      }
    } catch (err) {
      console.error("Failed to generate authorized client ID:", err);
    }
  };

  const handleEndDemo = async (req: DemoRequest) => {
    try {
      const res = await fetch("/api/demo-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: req.id,
          status: "ended",
          endedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        fetchDemoRequests();
        logUserActivity(
          currentUser.id,
          currentUser.name,
          `Ended demo request for ${req.name} (${req.company})`
        );
      }
    } catch (err) {
      console.error("Failed to end demo request:", err);
    }
  };

  const handleAcceptDemo = async (req: DemoRequest) => {
    try {
      const res = await fetch("/api/demo-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: req.id,
          status: "employee_accepted",
          acceptedBy: currentUser.id,
          acceptedByName: currentUser.name,
        }),
      });
      if (res.ok) {
        fetchDemoRequests();
        logUserActivity(
          currentUser.id,
          currentUser.name,
          `Accepted demo request from ${req.name} (${req.company})`
        );
      }
    } catch (err) {
      console.error("Failed to accept demo:", err);
    }
  };

  const handleManagerAssign = async (req: DemoRequest, assignedToId: string, assignedToName: string) => {
    try {
      const res = await fetch("/api/demo-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: req.id,
          status: "manager_assigned",
          assignedTo: assignedToId,
          assignedToName: assignedToName,
        }),
      });
      if (res.ok) {
        fetchDemoRequests();
        logUserActivity(
          currentUser.id,
          currentUser.name,
          `Manager assigned client ${req.name} (${req.company}) to employee ${assignedToName}`
        );
      }
    } catch (err) {
      console.error("Failed to assign demo:", err);
    }
  };

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
                email: req.requestedEmail,
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
          const res = await fetch("/api/users/kick", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: req.targetUserId, company: compKey }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to kick user from backend storage");
          }

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
      alert(err instanceof Error ? err.message : "Error approving kick authorization");
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
        if (data.recentQueries) {
          setRecentQueries(data.recentQueries);
        }
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAuthorizedCompanies();

    const isEkaba = (companyName || "ekaba").toLowerCase().trim().includes("ekaba");
    if (isEkaba) {
      fetchDemoRequests();
      fetchEkabaEmployees();
      const interval = setInterval(() => {
        fetchDemoRequests();
        fetchAuthorizedCompanies();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [companyName]);

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

  // Compute alerts/notifications
  const alerts: { id: string; message: string; type: "warning" | "danger" }[] = [];
  const isEkabaUser =
    (companyName || "ekaba").toLowerCase().trim().includes("ekaba") ||
    (currentUser?.email || "").endsWith("@ekaba.com");

  const now = new Date();

  if (isEkabaUser) {
    Object.keys(authorizedCompanies).forEach((compKey) => {
      const details = authorizedCompanies[compKey];
      if (details && details.employeeId === currentUser.id) {
        if (details.planExpiresAt) {
          const planExpires = new Date(details.planExpiresAt);
          const daysLeft = Math.ceil((planExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 7 && daysLeft > 0) {
            alerts.push({
              id: `plan-${compKey}`,
              message: `Plan subscription for client "${formatCompanyName(compKey)}" is expiring in ${daysLeft} days (${planExpires.toLocaleDateString()}). Please contact the owner to renew.`,
              type: "warning",
            });
          } else if (daysLeft <= 0) {
            alerts.push({
              id: `plan-${compKey}`,
              message: `Plan subscription for client "${formatCompanyName(compKey)}" has expired. Features are locked.`,
              type: "danger",
            });
          }
        } else if (details.demoExpiresAt) {
          const demoExpires = new Date(details.demoExpiresAt);
          const daysLeft = Math.ceil((demoExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 7 && daysLeft > 0) {
            alerts.push({
              id: `demo-${compKey}`,
              message: `Demo period for client "${formatCompanyName(compKey)}" is expiring in ${daysLeft} days. Please prompt the client to start a plan.`,
              type: "warning",
            });
          } else if (daysLeft <= 0) {
            alerts.push({
              id: `demo-${compKey}`,
              message: `Demo period for client "${formatCompanyName(compKey)}" has expired. Features are locked.`,
              type: "danger",
            });
          }
        }
      }
    });
  } else {
    const details = authorizedCompanies[(companyName || "").toLowerCase().trim()];
    if (details) {
      const repInfo = details.employeeName ? `${details.employeeName} (${details.employeeEmail})` : "EKABA Corporate Support (support@ekaba.com)";
      if (details.planExpiresAt) {
        const planExpires = new Date(details.planExpiresAt);
        const daysLeft = Math.ceil((planExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7 && daysLeft > 0) {
          alerts.push({
            id: "my-plan-expiring",
            message: `Your company's plan is expiring in ${daysLeft} days (${planExpires.toLocaleDateString()}). Please contact your representative ${repInfo} to renew.`,
            type: "warning",
          });
        }
      } else if (details.demoExpiresAt) {
        const demoExpires = new Date(details.demoExpiresAt);
        const daysLeft = Math.ceil((demoExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7 && daysLeft > 0) {
          alerts.push({
            id: "my-demo-expiring",
            message: `Your demo period is active. Expires in ${daysLeft} days. Please contact your representative ${repInfo} to activate a plan.`,
            type: "warning",
          });
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Card with Live Nodes indicator */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#0f172a]/60 backdrop-blur-md rounded-3xl p-6 md:p-8 text-white border border-slate-800/80 shadow-2xl relative overflow-hidden group">
        {/* Abstract background glowing primary orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Beautiful Blended Image Accent Card */}
        <div className="absolute top-0 right-0 bottom-0 w-1/3 opacity-10 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
            alt="Corporate Workspace Concept"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/60 via-slate-900/30 to-transparent"></div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10 max-w-2xl text-left">
          <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-7 h-7 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-tight">
                Secure {formatCompanyName(companyName || "")} Portal: Welcome, {currentUser.name}!
              </h1>
              <span className="text-[10px] bg-primary/10 text-primary font-mono border border-primary/30 px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">
                {currentUser.role}
              </span>
            </div>
            <p className="text-slate-350 text-xs mt-2 leading-relaxed">
              EKABA semantic artificial intelligence aggregates federated organizational material
              instantly and securely. Explore updated regulatory datasets, unified RAG querying
              hubs, and decentralized SSO approvals from this console.
            </p>
          </div>
        </div>

        {/* Live Cluster Nodes status widget */}
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shrink-0 w-full lg:w-auto relative z-10 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
          <div className="w-2 h-2 rounded-full bg-primary absolute left-[19px]"></div>
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              FIPS SSO Network Node
            </span>
            <span className="text-xs font-semibold text-primary font-mono">
              Status: ACTIVE OVERSEER
            </span>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {alerts.length > 0 && (
        <div className="space-y-3 text-left">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 border rounded-xl p-4 text-xs font-semibold ${
                alert.type === "danger"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.type === "danger" ? "text-rose-600" : "text-amber-700"}`} />
              <div className="flex-1 leading-relaxed">{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* EKABA Demo Request & Client Pipeline Dashboard */}
      {(companyName || "ekaba").toLowerCase().trim().includes("ekaba") && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">EKABA Client Demo Pipeline</h4>
                <p className="text-[11px] text-slate-500">
                  Track and assign incoming client demo requests.
                </p>
              </div>
            </div>
          </div>

          {/* Role-based panels */}
          {currentUser.role === "Employee" ? (
            // Employee View
            <div className="space-y-4">
              {/* 1. Pending Requests (Queue to Accept) */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  Incoming Requests Queue (Click to Accept Demo)
                </h5>
                {demoReqList.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic pl-4">No pending demo requests at this moment.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoReqList.filter(r => r.status === 'pending').map((req) => (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="text-xs font-bold text-slate-800">{req.name}</h6>
                              <span className="text-[10px] text-slate-500 block">{req.email}</span>
                            </div>
                            <span className="text-[9px] bg-slate-105 text-slate-600 font-mono px-2 py-0.5 rounded uppercase font-bold">{req.size}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            <div>Company: <strong className="text-slate-800">{req.company}</strong></div>
                            <div>Role: {req.role}</div>
                          </div>
                          {req.message && (
                            <p className="text-[10px] text-slate-500 italic border-t border-slate-100 pt-1.5 line-clamp-2">
                              &ldquo;{req.message}&rdquo;
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptDemo(req)}
                          className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white cursor-pointer transition shadow-sm active:scale-[0.98]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Your Assigned Clients */}
              <div className="border-t border-indigo-100 pt-3.5">
                <h5 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  Your Assigned Demo Clients (Compulsory)
                </h5>
                {demoReqList.filter(r => 
                  (r.status === 'manager_assigned' && r.assignedTo === currentUser.id) || 
                  (r.status === 'employee_accepted' && r.acceptedBy === currentUser.id) ||
                  (r.status === 'ended' && (r.assignedTo === currentUser.id || r.acceptedBy === currentUser.id))
                ).length === 0 ? (
                  <p className="text-[11px] text-slate-555 italic pl-4">You have no active demo client assignments right now.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoReqList.filter(r => 
                      (r.status === 'manager_assigned' && r.assignedTo === currentUser.id) || 
                      (r.status === 'employee_accepted' && r.acceptedBy === currentUser.id) ||
                      (r.status === 'ended' && (r.assignedTo === currentUser.id || r.acceptedBy === currentUser.id))
                    ).map((req) => {
                      const isCompulsory = req.status === 'manager_assigned' && req.assignedTo !== req.acceptedBy;
                      const companyDetails = req.company ? authorizedCompanies[req.company.toLowerCase().trim()] : null;
                      const authId = typeof companyDetails === "string" ? companyDetails : companyDetails?.authorizedClientId;
                      return (
                        <div key={req.id} className={`bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 ${
                          req.status === 'ended' 
                            ? 'opacity-70 bg-slate-50 border-slate-200 border-dashed' 
                            : 'border-slate-200 hover:shadow-md'
                        }`}>
                          {isCompulsory && (
                            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded-bl uppercase tracking-wider">
                              Forced Assignment
                            </div>
                          )}
                          <div className="space-y-2 text-left">
                            <div>
                              <h6 className="text-xs font-bold text-slate-800">{req.name}</h6>
                              <span className="text-[10px] text-slate-500 block">{req.email}</span>
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono">
                              <div>Company: <strong className="text-slate-800">{req.company}</strong></div>
                              <div>Status: 
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  req.status === 'ended'
                                    ? 'bg-slate-100 text-slate-600'
                                    : req.status === 'employee_accepted' 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {req.status === 'ended' 
                                    ? 'Ended' 
                                    : req.status === 'employee_accepted' 
                                      ? 'Awaiting Manager Confirm' 
                                      : 'Active Client'}
                                </span>
                              </div>
                            </div>

                            {/* Actions and Client ID Display */}
                            {req.status === 'ended' ? (
                              <div className="mt-3.5 p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] font-medium text-center">
                                User didn't choose to be with us
                              </div>
                            ) : (
                              <div className="mt-3.5 space-y-2">
                                {authId ? (
                                  <div className="space-y-2">
                                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-850 text-[10px] font-mono font-bold text-center">
                                      Client ID: {authId}
                                    </div>

                                    {/* Subscription Status details */}
                                    {(() => {
                                      const details = req.company ? authorizedCompanies[req.company.toLowerCase().trim()] : null;
                                      const now = new Date();
                                      let hasActivePlan = false;
                                      let planExpiresAt = null;
                                      let daysLeft = null;
                                      let showRenewButton = false;
                                      let planMonths = null;

                                      if (details) {
                                        planMonths = details.planMonths;
                                        if (details.planExpiresAt) {
                                          planExpiresAt = new Date(details.planExpiresAt);
                                          hasActivePlan = now <= planExpiresAt;
                                          daysLeft = Math.ceil((planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                          if (daysLeft <= 7) {
                                            showRenewButton = true;
                                          }
                                        } else if (details.demoExpiresAt) {
                                          const demoExpires = new Date(details.demoExpiresAt);
                                          daysLeft = Math.ceil((demoExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                          showRenewButton = now > demoExpires || daysLeft <= 7;
                                        }
                                      }

                                      return (
                                        <>
                                          <div className="text-[10px] text-slate-500 font-sans space-y-1 border-t pt-2 text-left">
                                            {hasActivePlan ? (
                                              <div>
                                                Plan: <span className="font-bold text-slate-700">{planMonths} Months</span>
                                                <span className="block text-[9px] text-indigo-600 font-semibold mt-0.5">
                                                  Expires in {daysLeft} days ({planExpiresAt?.toLocaleDateString()})
                                                </span>
                                              </div>
                                            ) : (
                                              <div>
                                                Plan: <span className="text-amber-600 font-bold">Demo Period (7 Days)</span>
                                                {daysLeft !== null && (
                                                  <span className={`block text-[9px] font-semibold mt-0.5 ${daysLeft <= 0 ? 'text-rose-600 font-bold' : 'text-amber-650'}`}>
                                                    {daysLeft <= 0 ? 'Demo expired (Features locked)' : `Demo expires in ${daysLeft} days`}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {/* Plan Selector */}
                                          {activePlanSelector[req.id] ? (
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
                                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block text-center mb-1">
                                                Select Subscription Plan
                                              </span>
                                              <div className="grid grid-cols-3 gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    handleStartPlan(req.company, 1);
                                                    setActivePlanSelector(prev => ({ ...prev, [req.id]: false }));
                                                  }}
                                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1.5 px-1 rounded transition cursor-pointer"
                                                >
                                                  1 Month
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    handleStartPlan(req.company, 6);
                                                    setActivePlanSelector(prev => ({ ...prev, [req.id]: false }));
                                                  }}
                                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1.5 px-1 rounded transition cursor-pointer"
                                                >
                                                  6 Months
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    handleStartPlan(req.company, 12);
                                                    setActivePlanSelector(prev => ({ ...prev, [req.id]: false }));
                                                  }}
                                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1.5 px-1 rounded transition cursor-pointer"
                                                >
                                                  12 Months
                                                </button>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setActivePlanSelector(prev => ({ ...prev, [req.id]: false }))}
                                                className="w-full text-[9px] font-semibold text-slate-400 hover:underline pt-1"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          ) : (
                                            (showRenewButton || !hasActivePlan) && (
                                              <button
                                                type="button"
                                                onClick={() => setActivePlanSelector(prev => ({ ...prev, [req.id]: true }))}
                                                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition duration-200 cursor-pointer shadow-sm"
                                              >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                <span>{!hasActivePlan ? 'Start Plan' : 'Renew Subscription'}</span>
                                              </button>
                                            )
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCreateAuthorizedId(req)}
                                    className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition duration-200 cursor-pointer shadow-sm"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Create Authorized Client ID</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEndDemo(req)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold py-2 px-3 rounded-lg border border-rose-200 hover:border-rose-300 transition duration-200 cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>End Demo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Manager / Owner View
            <div className="space-y-4">
              {/* 1. Accepted Requests awaiting assignment approval */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Pending Employee Demo Approvals & Assignments
                </h5>
                {demoReqList.filter(r => r.status === 'employee_accepted').length === 0 ? (
                  <p className="text-[11px] text-slate-555 italic pl-4">No pending assignments waiting for your review.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoReqList.filter(r => r.status === 'employee_accepted').map((req) => (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-2 text-left">
                          <div>
                            <h6 className="text-xs font-bold text-slate-800">{req.name}</h6>
                            <span className="text-[10px] text-slate-500 block">{req.email}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            <div>Company: <strong className="text-slate-800">{req.company}</strong></div>
                            <div className="mt-1 text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 rounded px-2 py-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Accepted by: {req.acceptedByName}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                          {/* Confirm option */}
                          <button
                            type="button"
                            onClick={() => handleManagerAssign(req, req.acceptedBy || '', req.acceptedByName || '')}
                            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white cursor-pointer transition shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm assignment to {req.acceptedByName}</span>
                          </button>

                          {/* Reassign select dropdown */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Switch to another employee:</label>
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const emp = ekabaEmployees.find(u => u.id === val);
                                if (emp) {
                                  handleManagerAssign(req, emp.id, emp.name);
                                }
                              }}
                              className="w-full bg-slate-55 border border-slate-200 rounded-lg py-1 px-2 text-[10px] text-slate-700 font-semibold focus:outline-none"
                            >
                              <option value="" disabled>-- Select Employee to Assign --</option>
                              {ekabaEmployees.filter(u => u.id !== req.acceptedBy).map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. All Confirmed Assignments */}
              <div className="border-t border-indigo-100 pt-3.5">
                <h5 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-650"></span>
                  Active Confirmed Demo Assignments
                </h5>
                {demoReqList.filter(r => r.status === 'manager_assigned').length === 0 ? (
                  <p className="text-[11px] text-slate-555 italic pl-4">No active assignments confirmed yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoReqList.filter(r => r.status === 'manager_assigned').map((req) => (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-2 text-left">
                          <div>
                            <h6 className="text-xs font-bold text-slate-800">{req.name}</h6>
                            <span className="text-[10px] text-slate-500 block">{req.email}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            <div>Company: <strong className="text-slate-800">{req.company}</strong></div>
                            <div className="mt-1 text-emerald-800 font-bold bg-emerald-55 border border-emerald-100 rounded px-2 py-0.5">
                              Assigned to: {req.assignedToName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time SSO Registration Security Clearance Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-subtle-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-805">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-850">
                  SSO Registration Clearance Requests
                </h4>
                <p className="text-[11px] text-stone-500">
                  The following users requested security clearance to register a new profile with a privileged role.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-amber-100 text-amber-900 text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-200 animate-pulse">
              {pendingApprovals.length} Clearances
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition relative overflow-hidden"
              >
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-stone-850">{req.name}</h5>
                      <span className="text-[9px] text-amber-808 font-mono tracking-wider block bg-amber-55 px-1.5 py-0.5 rounded font-bold uppercase">
                        Requested: {req.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px]/relaxed text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 space-y-1 font-mono">
                    <div className="truncate">
                      Email:{" "}
                      <span className="text-stone-800 font-bold">{req.domain}</span>
                    </div>
                    <div>
                      Sponsor:{" "}
                      <span className="text-stone-800 font-bold">{req.sponsorName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleRejectClearance(req.id)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-rose-200 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveClearance(req.id, req.name)}
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

      {/* Real-time Document Download Clearance Queue */}
      {(currentUser.role === "Owner" || currentUser.role === "Manager") && downloadRequests.filter(r => r.status === "pending").length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-subtle-pulse text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-805">
                <ShieldCheck className="w-5 h-5 text-amber-700 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-850">
                  Document Download Sponsoring Requests
                </h4>
                <p className="text-[11px] text-stone-500">
                  The following users requested security clearance to download a document under RBAC restrictions.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-amber-100 text-amber-900 text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-200 animate-pulse">
              {downloadRequests.filter(r => r.status === "pending").length} Requests
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadRequests.filter(r => r.status === "pending").map((req) => (
              <div
                key={req.id}
                className="bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-stone-850">{req.requestedBy}</h5>
                      <span className="text-[9px] text-amber-808 font-mono tracking-wider block bg-amber-55 px-1.5 py-0.5 rounded font-bold uppercase">
                        Role: {req.requestedByRole}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px]/relaxed text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 space-y-1 font-mono">
                    <div className="truncate">
                      File: <span className="text-stone-800 font-bold">{req.documentName}</span>
                    </div>
                    <div>
                      Requested: <span className="text-stone-850 font-bold">{new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleApproveDownload(req.id, "rejected")}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-rose-200 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition shadow-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveDownload(req.id, "approved")}
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
          <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-md space-y-5 transition-all hover:shadow-lg hover:border-primary/25 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block mb-1">
                Corporate Index Retrieval
              </span>
              <h3 className="text-md font-display font-bold text-foreground">
                Execute Semantic Search Query
              </h3>
              <p className="text-muted-foreground text-xs">
                Matches questions and compliance files against vectors mapped in the secure sandbox
                directory.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/65" />
                <input
                  type="text"
                  placeholder="Ask a question (e.g., 'What is the leave approval process for employees?')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-primary rounded-xl py-3 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-50 rounded-xl py-3 px-5 text-xs font-bold font-sans tracking-wide transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                {searching ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Chunks...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
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
          <div className="bg-[#10141d]/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-primary animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Quick-Launch Guided Prompts
                </h4>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
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
                  bg: "border-slate-800/80 hover:border-primary/50 hover:bg-secondary/20",
                  text: "Allows employees to understand per-diem criteria and daily cap bounds.",
                },
                {
                  title: "Approval Chains & Leaves",
                  role: "Managers & HR",
                  icon: "calendar",
                  query: "What processes do I follow for leave approval?",
                  bg: "border-slate-800/80 hover:border-primary/50 hover:bg-secondary/25",
                  text: "Clarifies HRMS submissions, manager authorization nodes, and timing specs.",
                },
                {
                  title: "Physical & Network Cryptography",
                  role: "IT & Admin",
                  icon: "lock",
                  query: "What encryption standards are specified for GDPR?",
                  bg: "border-slate-800/80 hover:border-primary/50 hover:bg-secondary/20",
                  text: "Inspect rules detailing static rest storage and secure flight TLS encryption.",
                },
                {
                  title: "General Code of Conduct",
                  role: "Staff Team",
                  icon: "users",
                  query:
                    "What guidelines are specified for conflict resolution in team project audits?",
                  bg: "border-slate-800/80 hover:border-primary/50 hover:bg-secondary/20",
                  text: "Standard procedures for handling project milestones and workflow disputes.",
                },
              ].map((act, index) => (
                <div
                  key={index}
                  onClick={() => onNavigateToChat(act.query)}
                  className={`bg-[#0b0e14]/50 border rounded-xl p-3.5 hover:shadow-lg cursor-pointer transition-all duration-300 text-left ${act.bg} group flex flex-col justify-between hover:scale-[1.01] relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/45 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors">
                        {act.title}
                      </span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-slate-800">
                        {act.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{act.text}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500 font-mono group-hover:text-primary font-bold transition-colors">
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
                <span>माँ से बात करें</span>
              </button>
            </div>
          </div>

          {/* Interactive RAG Vector Space 3D Visualizer */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest px-1">
              Embedding space visualization
            </h5>
            <VectorSpace3D />
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
                <div className="p-1.5 bg-[#0b0e14]/50 border border-slate-800 text-primary rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-100">
                {analytics.activeUsers}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">SEAMLESS LOGINS TODAY</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm space-y-2 transition hover:shadow-md hover:border-primary/25">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">SEARCH SUCCESS</span>
                <div className="p-1.5 bg-[#0b0e14]/50 border border-slate-800 text-emerald-500 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-100">
                {analytics.searchSuccessRate}%
              </div>
              {/* Mini visual success metric progress bar */}
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${analytics.searchSuccessRate}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase">
                Target Accuracy Achieved
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm space-y-2 transition hover:shadow-md hover:border-primary/25">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">QUERY VOLUME</span>
                <div className="p-1.5 bg-[#0b0e14]/50 border border-slate-800 text-primary rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-100">
                {analytics.queryVolume}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">TOTAL CONVERSATIONS LOGGED</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm space-y-2 transition hover:shadow-md hover:border-primary/25">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">SATISFACTION INDEX</span>
                <div className="p-1.5 bg-[#0b0e14]/50 border border-slate-800 text-primary rounded-lg">
                  <ThumbsUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3.5xl font-display font-bold text-slate-100">
                {analytics.userSatisfaction}%
              </div>
              {/* Mini visual sentiment bar */}
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${analytics.userSatisfaction}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase">User Approval Rate</p>
            </div>
          </div>

          {/* Visual SVG Analytics Charts */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Daily Usage Bar Chart */}
            <div className="md:col-span-8 bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-6 transition hover:shadow-md hover:border-primary/25 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
                <div>
                  <h3 className="font-display font-bold text-slate-200 text-md">
                    Daily System Volume
                  </h3>
                  <p className="text-xs text-slate-500">
                    Query traffic metrics in the past calendar week
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary font-mono uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 animate-none">
                  <TrendingUp className="w-3 h-3" />
                  <span>Up 12% vs last week</span>
                </div>
              </div>

              {/* Advanced SVG Bar Chart with subtle gradients and drop shadows */}
              <div className="w-full h-56 flex items-end justify-between px-2 pt-4 relative">
                {/* Horizontal grid guide lines */}
                <div className="absolute inset-x-0 bottom-4 border-b border-slate-850 font-sans"></div>
                <div className="absolute inset-x-0 bottom-16 border-b border-slate-850/50"></div>
                <div className="absolute inset-x-0 bottom-28 border-b border-slate-850/50"></div>
                <div className="absolute inset-x-0 bottom-40 border-b border-slate-850/30"></div>

                {analytics.dailyUsage.map((day, dIdx) => {
                  const maxCount = Math.max(...analytics.dailyUsage.map((d) => d.count), 1);
                  const barHeightPercent = (day.count / maxCount) * 85; // max height to fit text nicely

                  return (
                    <div
                      key={dIdx}
                      className="flex-1 flex flex-col items-center group relative z-10 space-y-2"
                    >
                      <div
                        className="relative w-10 sm:w-12 bg-slate-900 hover:bg-slate-800 rounded-t-lg transition-all duration-300 flex items-end justify-center"
                        style={{ height: `${Math.max(barHeightPercent, 10)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 block absolute -top-8 bg-slate-950 text-slate-200 rounded border border-slate-800 text-[10px] px-2 py-0.5 whitespace-nowrap transition-all shadow font-mono font-bold z-20">
                          {day.count} queries
                        </span>
                        {/* Interactive inner gradients */}
                        <div className="w-full h-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all shadow-inner"></div>
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
            <div className="md:col-span-4 bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-4 transition hover:shadow-md hover:border-primary/25 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <h3 className="font-display font-bold text-slate-200 text-md">
                  Top Searched Topics
                </h3>
                <p className="text-xs text-slate-500">Most queried terms & compliance documents</p>
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
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-350">
                        <span className="font-bold">{topic.topic}</span>
                        <span className="text-slate-500 font-mono">{topic.count} hits</span>
                      </div>
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
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
          <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800/60 pb-4 gap-2">
              <div>
                <h3 className="font-display font-bold text-slate-200 text-md">
                  Recent Auditable Queries
                </h3>
                <p className="text-xs text-slate-500">
                  Secure, role-based real-time request log histories
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="text-xs bg-[#0b0e14]/50 hover:bg-[#0b0e14] border border-slate-800 text-slate-300 rounded-lg px-3 py-2 inline-flex items-center gap-1.5 font-bold cursor-pointer transition shadow-sm shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Logs Channel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold tracking-wider uppercase">
                    <th className="py-2.5 pb-3">User & Access Role</th>
                    <th className="py-2.5 pb-3">Request Text</th>
                    <th className="py-2.5 pb-3">Response Preview</th>
                    <th className="py-2.5 pb-3">Source Citation</th>
                    <th className="py-2.5 pb-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {recentQueries.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/10 transition">
                      <td className="py-3.5 pr-2 font-medium">
                        <div className="font-bold text-slate-200">{log.userName}</div>
                        <div className="text-[10px] font-bold text-slate-500 font-mono tracking-wide">
                          {log.userRole}
                        </div>
                      </td>
                      <td
                        className="py-3.5 pr-2 max-w-[200px] sm:max-w-xs truncate font-medium text-slate-200"
                        title={log.queryText}
                      >
                        {log.queryText}
                      </td>
                      <td className="py-3.5 pr-2 max-w-[200px] sm:max-w-xs truncate text-[11px] text-slate-400 font-sans">
                        {log.responseText}
                      </td>
                      <td className="py-3.5 pr-2 font-mono text-[10px] text-primary font-bold uppercase tracking-wider">
                        {log.citations && log.citations.length > 0
                          ? log.citations[0].sourceDoc
                          : "None"}
                      </td>
                      <td className="py-3.5 text-right">
                        {log.feedback?.rating === "like" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono border border-emerald-500/20">
                            APPROVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[10px] font-bold font-mono border border-slate-800">
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
