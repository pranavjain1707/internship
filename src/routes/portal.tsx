import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  ShieldAlert,
  Lock,
  UserCircle,
  Bot,
  Shield,
  KeyRound,
  ArrowRight,
  Building,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  Info,
  Clock,
  Palette,
} from "lucide-react";
import {
  User,
  UserRole,
  ROLE_HIERARCHY,
  PendingApprovalRequest,
  PendingProfileRequest,
} from "../types";
import { useTheme, THEME_LABELS } from "../components/ThemeProvider";
import Dashboard from "../components/portal/Dashboard";
import ChatInterface from "../components/portal/ChatInterface";
import DocumentCenter from "../components/portal/DocumentCenter";
import AdminPanel from "../components/portal/AdminPanel";
import ProfileSettings from "../components/portal/ProfileSettings";
import ActivityLogs from "../components/portal/ActivityLogs";
import { logUserActivity } from "../lib/activity-client";

// ==========================================
// 1. Full Page SSO Login Screen component
// ==========================================
const AUTHORIZED_COMPANIES: Record<string, string> = {
  ekaba: "EKABA-TEAM-2026",
  "ekaba internal": "EKABA-TEAM-2026",
  google: "GOOG-EKABA-99",
  "acme corp": "ACME-EKABA-12",
  microsoft: "MSFT-EKABA-88",
  apple: "AAPL-EKABA-77",
};

const formatCompanyName = (name: string) => {
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
const getDefaultOwnerForCompany = (companyKey: string) => {
  const c = companyKey.toLowerCase().trim();
  if (c === "google") {
    return { name: "Sundar Pichai", domain: "google.com", password: "GoogleOwner@2026" };
  }
  if (c === "acme corp" || c === "acme") {
    return { name: "Wile E. Coyote", domain: "acme.com", password: "AcmeOwner@2026" };
  }
  if (c === "microsoft") {
    return { name: "Satya Nadella", domain: "microsoft.com", password: "MsftOwner@2026" };
  }
  if (c === "apple") {
    return { name: "Tim Cook", domain: "apple.com", password: "AppleOwner@2026" };
  }
  return { name: "Pranav Jain", domain: "jainpranav1707@gmail.com", password: "Pj@17072006" };
};

const getDefaultUsersForCompany = (companyKey: string) => {
  const c = companyKey.toLowerCase().trim();
  if (c === "google") {
    return [
      {
        name: "Larry Page",
        domain: "google.com",
        password: "GoogleEmp@2026",
        role: "Employee" as UserRole,
      },
      {
        name: "Sergey Brin",
        domain: "google.com",
        password: "GoogleMgr@2026",
        role: "Manager" as UserRole,
      },
      {
        name: "Ruth Porat",
        domain: "google.com",
        password: "GoogleHR@2026",
        role: "HR Officer" as UserRole,
      },
      {
        name: "Jeff Dean",
        domain: "google.com",
        password: "GoogleIT@2026",
        role: "IT Administrator" as UserRole,
      },
    ];
  }
  if (c === "acme corp" || c === "acme") {
    return [
      {
        name: "Road Runner",
        domain: "acme.com",
        password: "AcmeEmp@2026",
        role: "Employee" as UserRole,
      },
      {
        name: "Bugs Bunny",
        domain: "acme.com",
        password: "AcmeMgr@2026",
        role: "Manager" as UserRole,
      },
      {
        name: "Daffy Duck",
        domain: "acme.com",
        password: "AcmeHR@2026",
        role: "HR Officer" as UserRole,
      },
      {
        name: "Elmer Fudd",
        domain: "acme.com",
        password: "AcmeIT@2026",
        role: "IT Administrator" as UserRole,
      },
    ];
  }
  if (c === "microsoft") {
    return [
      {
        name: "Bill Gates",
        domain: "microsoft.com",
        password: "MsftEmp@2026",
        role: "Employee" as UserRole,
      },
      {
        name: "Paul Allen",
        domain: "microsoft.com",
        password: "MsftMgr@2026",
        role: "Manager" as UserRole,
      },
      {
        name: "Steve Ballmer",
        domain: "microsoft.com",
        password: "MsftHR@2026",
        role: "HR Officer" as UserRole,
      },
      {
        name: "Kevin Scott",
        domain: "microsoft.com",
        password: "MsftIT@2026",
        role: "IT Administrator" as UserRole,
      },
    ];
  }
  if (c === "apple") {
    return [
      {
        name: "Steve Jobs",
        domain: "apple.com",
        password: "AppleEmp@2026",
        role: "Employee" as UserRole,
      },
      {
        name: "Steve Wozniak",
        domain: "apple.com",
        password: "AppleMgr@2026",
        role: "Manager" as UserRole,
      },
      {
        name: "Craig Federighi",
        domain: "apple.com",
        password: "AppleHR@2026",
        role: "HR Officer" as UserRole,
      },
      {
        name: "Phil Schiller",
        domain: "apple.com",
        password: "AppleIT@2026",
        role: "IT Administrator" as UserRole,
      },
    ];
  }
  return [
    {
      name: "Alice Smith",
      domain: "ekaba.com",
      password: "Password@123",
      role: "Employee" as UserRole,
    },
    {
      name: "John Doe",
      domain: "ekaba.com",
      password: "Password@123",
      role: "Manager" as UserRole,
    },
    {
      name: "Sarah Connor",
      domain: "ekaba.com",
      password: "Password@123",
      role: "HR Officer" as UserRole,
    },
    {
      name: "Dave Miller",
      domain: "ekaba.com",
      password: "Password@123",
      role: "IT Administrator" as UserRole,
    },
  ];
};

function SecurityVault3D() {
  const [logs, setLogs] = useState<string[]>([
    "Initial handshake requested...",
    "Loading FIPS 140-2 encryption modules...",
    "SSO token validation pending...",
  ]);

  useEffect(() => {
    const logPool = [
      "SSO signature gateway: authorized.",
      "AES-256 session key generated.",
      "Auditable ledger node synced.",
      "Row-level policy filters loaded.",
      "Workspace session initialized successfully.",
      "Access scope: IT & HR schemas loaded.",
      "Compliance check: SOC 2 active.",
    ];

    const interval = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(1), logPool[Math.floor(Math.random() * logPool.length)]];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[16/11] screen-3d-wrap my-6">
      <div className="screen-3d screen-glow rounded-xl border border-slate-800 bg-[#0b0e14] p-4 flex flex-col justify-between font-mono text-[10px] text-slate-300 relative overflow-hidden h-full shadow-2xl">
        {/* Gloss overlay */}
        <div className="screen-gloss" />
        <div className="scan-line" />

        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/80" />
            <span className="h-2 w-2 rounded-full bg-amber-500/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
            <span className="ml-1 text-[8px] text-slate-500">vault-sso-gateway:~/bin</span>
          </div>
          <span className="text-[8px] font-bold text-primary animate-pulse uppercase">
            SECURE TUNNEL
          </span>
        </div>

        {/* Live log stream */}
        <div className="flex-1 space-y-2 overflow-hidden text-emerald-400/90 leading-relaxed text-left">
          <div className="text-[9px] text-slate-500 font-bold mb-1">
            === SYSTEM INTEGRITY DEPLOYMENT LOGS ===
          </div>
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2 items-start animate-fade-in">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>

        {/* Access controls visualization */}
        <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="h-5 w-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="h-3 w-3 text-primary animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-200">FIPS Cryptography</div>
              <div className="text-[8px] text-slate-500">AES-256 tunnel enabled</div>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface LoginScreenProps {
  onLoginSuccess: (user: User, company: string) => void;
}

function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme, toggleTheme, cycleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Employee");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<
    | "company_verification"
    | "credentials"
    | "permission"
    | "pending_approval"
    | "password"
    | "email_reset"
    | "pending_email_reset"
  >("company_verification");
  const [companyName, setCompanyName] = useState("");
  const [authorizedId, setAuthorizedId] = useState("");
  const [verifiedCompany, setVerifiedCompany] = useState("");
  const [passwordMode, setPasswordMode] = useState<"enter" | "create">("enter");
  const [selectedApproverKey, setSelectedApproverKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Suggested demo users from the system state
  const demoUsers: Record<
    UserRole,
    { name: string; email: string; avatar: string; description: string }
  > = {
    Employee: {
      name: "",
      email: "",
      avatar: "EM",
      description: "Needs quick policy lookups, handbook retrieval, and remote work guidelines.",
    },
    Manager: {
      name: "",
      email: "",
      avatar: "MG",
      description:
        "Manages team spend, processes travel claims, and handles operational workflows.",
    },
    "HR Officer": {
      name: "",
      email: "",
      avatar: "HR",
      description:
        "Manages leaves policies, edits guidelines, and answers employee policy queries.",
    },
    "IT Administrator": {
      name: "",
      email: "",
      avatar: "IT",
      description:
        "Grants access roles, monitors system logs, evaluates RAG analytics and compliance.",
    },
    Owner: {
      name: "Pranav Jain",
      email: "jainpranav1707@gmail.com",
      avatar: "PJ",
      description:
        "Supreme institutional owner. Unrestricted institutional-wide command authority and ledger control.",
    },
  };

  const selectedProfile = demoUsers[selectedRole];

  // Custom SSO Profile States
  const [customName, setCustomName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isEmailMismatch, setIsEmailMismatch] = useState(false);

  // Sponsoring Authority Approval States for new users
  const [sponsorInfo, setSponsorInfo] = useState("");

  const [authorizedCompanies, setAuthorizedCompanies] =
    useState<Record<string, any>>(AUTHORIZED_COMPANIES);

  useEffect(() => {
    fetch("/api/authorized-companies")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setAuthorizedCompanies(data);
        }
      })
      .catch((err) => console.error("Error loading authorized companies from DB:", err));
  }, []);

  // Local storage check for dynamic request approvals
  useEffect(() => {
    if (step !== "pending_approval" && step !== "pending_email_reset") return;

    const interval = setInterval(() => {
      const pollCompKey = verifiedCompany.trim().toLowerCase() || "ekaba";

      if (step === "pending_approval") {
        const approvalsStr = localStorage.getItem(`kb_portal_pending_approvals_${pollCompKey}`);
        if (approvalsStr) {
          try {
            const approvals: PendingApprovalRequest[] = JSON.parse(approvalsStr);
            const myReq = approvals.find(
              (req) => req.name.toLowerCase() === customName.trim().toLowerCase(),
            );
            if (myReq && myReq.status === "approved") {
              setSponsorInfo(`Approved by ${myReq.approvedBy || myReq.sponsorName}`);
              setPasswordMode("create");
              setPassword("");
              setStep("password");

              // Clean up request once processed
              const updated = approvals.filter(
                (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
              );
              localStorage.setItem(
                `kb_portal_pending_approvals_${pollCompKey}`,
                JSON.stringify(updated),
              );
            } else if (myReq && myReq.status === "rejected") {
              setError(
                `Your clearance request has been rejected by ${myReq.approvedBy || myReq.sponsorName}.`,
              );
              setStep("credentials");

              // Clean up request
              const updated = approvals.filter(
                (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
              );
              localStorage.setItem(
                `kb_portal_pending_approvals_${pollCompKey}`,
                JSON.stringify(updated),
              );
            }
          } catch (err) {
            console.error("Error reading approvals during poll:", err);
          }
        }
      } else if (step === "pending_email_reset") {
        const profileStr = localStorage.getItem(`kb_portal_pending_profile_reqs_${pollCompKey}`);
        if (profileStr) {
          try {
            const profileReqs: PendingProfileRequest[] = JSON.parse(profileStr);
            const myReq = profileReqs.find(
              (req) =>
                req.userName.toLowerCase() === customName.trim().toLowerCase() &&
                req.status !== "pending",
            );
            if (myReq) {
              if (myReq.status === "approved") {
                // Success: the email was updated in the DB
                setCustomEmail(myReq.requestedEmail);
                setError("");

                // Show notification and transition directly to entering password
                setSponsorInfo(`Email reset approved by ${myReq.approvedBy || myReq.sponsorName}`);
                setPasswordMode("enter");
                setPassword("");
                setStep("password");
              } else if (myReq.status === "rejected") {
                setError(
                  `Your email reset request was rejected by ${myReq.approvedBy || myReq.sponsorName}.`,
                );
                setStep("credentials");
              }

              // Remove request from pending queue
              const updated = profileReqs.filter((r) => r.id !== myReq.id);
              localStorage.setItem(
                `kb_portal_pending_profile_reqs_${pollCompKey}`,
                JSON.stringify(updated),
              );
            }
          } catch (err) {
            console.error("Error reading profile requests during poll:", err);
          }
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [step, customName, verifiedCompany]);

  // Load and merge Master backend credentials into client local database
  useEffect(() => {
    if (!verifiedCompany) return;
    fetch(`/api/users/db?company=${encodeURIComponent(verifiedCompany)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((backendDb) => {
        const localDb = getStoredUsers(verifiedCompany);
        const merged = { ...localDb, ...backendDb };
        saveStoredUsers(merged, verifiedCompany);
      })
      .catch((err) => console.error("Database sync inactive or pending sync:", err));
  }, [verifiedCompany]);

  // Local storage helpers to store & retrieve registered users dynamically
  interface StoredUser {
    name: string;
    domain: string;
    password: string;
    role: UserRole;
    email?: string;
  }

  const getStoredUsers = (compName = verifiedCompany): Record<string, StoredUser> => {
    const storedUsersCompKey = compName.trim().toLowerCase() || "ekaba";
    const data = localStorage.getItem(`kb_portal_users_db_${storedUsersCompKey}`);

    // Load list of kicked default users to prevent re-adding them
    const kickedUsersStr =
      localStorage.getItem(`kb_portal_kicked_users_${storedUsersCompKey}`) || "[]";
    let kickedUsers: string[] = [];
    try {
      kickedUsers = JSON.parse(kickedUsersStr);
    } catch (e) {}

    if (data) {
      try {
        const parsed = JSON.parse(data);
        let changed = false;

        // Ensure default Owner for this company exists
        const defaultOwner = getDefaultOwnerForCompany(storedUsersCompKey);
        const ownerKey = defaultOwner.name.toLowerCase();
        if (!kickedUsers.includes(ownerKey)) {
          if (!parsed[ownerKey]) {
            parsed[ownerKey] = {
              name: defaultOwner.name,
              domain: defaultOwner.domain,
              password: defaultOwner.password,
              role: "Owner",
              email: "jainpranav1707@gmail.com",
            };
            changed = true;
          } else {
            parsed[ownerKey].password = defaultOwner.password;
            parsed[ownerKey].role = "Owner";
            parsed[ownerKey].domain = defaultOwner.domain;
            parsed[ownerKey].email = "jainpranav1707@gmail.com";
          }
        }

        // Ensure default users exist (unless they were kicked)
        const defaultUsers = getDefaultUsersForCompany(storedUsersCompKey);
        for (const u of defaultUsers) {
          const userKey = u.name.toLowerCase();
          if (kickedUsers.includes(userKey)) {
            if (parsed[userKey]) {
              delete parsed[userKey];
              changed = true;
            }
            continue;
          }
          if (!parsed[userKey]) {
            const dynamicEmail = u.name.trim().toLowerCase().replace(/\s+/g, ".") + "@" + u.domain;
            parsed[userKey] = {
              name: u.name,
              domain: u.domain,
              password: u.password,
              role: u.role,
              email: dynamicEmail,
            };
            changed = true;
          }
        }

        if (changed) {
          localStorage.setItem(`kb_portal_users_db_${storedUsersCompKey}`, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback below if corrupted
      }
    }

    // Initialize with default Owner and Users
    const defaultOwner = getDefaultOwnerForCompany(storedUsersCompKey);
    const initialDb: Record<string, StoredUser> = {};

    const ownerKey = defaultOwner.name.toLowerCase();
    if (!kickedUsers.includes(ownerKey)) {
      initialDb[ownerKey] = {
        name: defaultOwner.name,
        domain: defaultOwner.domain,
        password: defaultOwner.password,
        role: "Owner",
        email: "jainpranav1707@gmail.com",
      };
    }

    const defaultUsers = getDefaultUsersForCompany(storedUsersCompKey);
    for (const u of defaultUsers) {
      const userKey = u.name.toLowerCase();
      if (kickedUsers.includes(userKey)) continue;
      const dynamicEmail = u.name.trim().toLowerCase().replace(/\s+/g, ".") + "@" + u.domain;
      initialDb[userKey] = {
        name: u.name,
        domain: u.domain,
        password: u.password,
        role: u.role,
        email: dynamicEmail,
      };
    }
    localStorage.setItem(`kb_portal_users_db_${storedUsersCompKey}`, JSON.stringify(initialDb));
    return initialDb;
  };

  const saveStoredUsers = (db: Record<string, StoredUser>, compName = verifiedCompany) => {
    const saveUsersCompKey = compName.trim().toLowerCase() || "ekaba";
    localStorage.setItem(`kb_portal_users_db_${saveUsersCompKey}`, JSON.stringify(db));
  };

  const getIdpForRole = (role: UserRole) => {
    if (role === "Owner") return "Global System Owner Cryptographic Signature Gateway";
    if (role === "IT Administrator") return "Google Workspace Federated Identity Provider";
    if (role === "HR Officer") return "Okta Enterprise Identity Suite (HR SSO)";
    return "Microsoft Active Directory Federated SSO";
  };

  const getEligibleApprovers = (newRole: UserRole) => {
    const db = getStoredUsers();
    return Object.values(db).filter((user) => {
      const parentRank = ROLE_HIERARCHY[user.role] || 0;
      const targetRank = ROLE_HIERARCHY[newRole] || 0;
      return newRole === "Owner" ? parentRank >= targetRank : parentRank > targetRank;
    });
  };

  const handleSendCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@") || !customEmail.includes(".")) {
      setError("Please provide a valid corporate email (e.g. employee@company.com).");
      return;
    }
    if (!customName.trim()) {
      setError(`Please provide your full ${selectedRole.toLowerCase()} name.`);
      return;
    }
    setLoading(true);

    try {
      // Check if it is a demo request matching name and email
      const verifyRes = await fetch("/api/demo-request/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: verifiedCompany,
          name: customName,
          email: customEmail,
        }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
          setLoading(false);
          setIsEmailMismatch(false);
          setPasswordMode("create");
          setSelectedRole("Owner");
          setCustomDomain(customEmail.split("@")[1] || "enterprise.com");
          setPassword("");
          setStep("password");
          return;
        }
      }
    } catch (err) {
      console.warn("[portal] Demo request verification failed:", err);
    }

    setTimeout(() => {
      setLoading(false);

      const db = getStoredUsers();
      const lowerName = customName.trim().toLowerCase();

      if (db[lowerName]) {
        // Existing registered user
        const registered = db[lowerName];

        // Calculate the expected email for this user
        const expectedEmail =
          registered.email ||
          (registered.name.toLowerCase() === "pranav jain"
            ? "jainpranav1707@gmail.com"
            : registered.domain.includes("@")
              ? registered.domain
              : registered.name.trim().toLowerCase().replace(/\s+/g, ".") +
                "@" +
                registered.domain);

        if (customEmail.trim().toLowerCase() === expectedEmail.toLowerCase()) {
          // Email matches! Require password verification
          setIsEmailMismatch(false);
          setPasswordMode("enter");
          setSelectedRole(registered.role);
          setCustomDomain(registered.domain);
          setPassword("");
          setStep("password");
        } else {
          // Email mismatch! Show warning and button to reset email
          setIsEmailMismatch(true);
          setError(
            `Email address does not match the registered record for "${registered.name}". Please check the spelling or request an email reset.`,
          );
        }
      } else {
        // First-time user registration - require sponsoring clearance from upper staff
        setIsEmailMismatch(false);
        setCustomDomain(customEmail.split("@")[1] || "enterprise.com");
        setStep("permission");
        const approvers = getEligibleApprovers(selectedRole);
        if (approvers.length > 0) {
          setSelectedApproverKey(approvers[0].name.toLowerCase());
        } else {
          setSelectedApproverKey("");
        }
      }
    }, 700);
  };

  const handleSendEmailResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@") || !customEmail.includes(".")) {
      setError("Please provide a valid corporate email address (e.g. name@company.com).");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const db = getStoredUsers();
      const lowerName = customName.trim().toLowerCase();
      const userRecord = db[lowerName];
      if (!userRecord) {
        setError("User profile not found. Please go back.");
        return;
      }

      const approverName = selectedApproverKey.toLowerCase();
      const approver = db[approverName];
      const approverFullName = approver ? approver.name : selectedApproverKey;

      const reqCompKey = verifiedCompany.trim().toLowerCase() || "ekaba";
      const profileReqs: PendingProfileRequest[] = JSON.parse(
        localStorage.getItem(`kb_portal_pending_profile_reqs_${reqCompKey}`) || "[]",
      );

      // Clean up past entries with same name to avoid duplicates
      const updated = profileReqs.filter(
        (req) => req.userName.toLowerCase() !== customName.trim().toLowerCase(),
      );

      const userId = `u-${lowerName.replace(/\s+/g, "-") || Date.now()}`;

      const newRequest: PendingProfileRequest = {
        id: `req-reset-${Date.now()}`,
        userId: userId,
        userName: userRecord.name,
        requestedEmail: customEmail.trim(),
        requestedByRole: userRecord.role,
        sponsorName: approverFullName,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      updated.push(newRequest);
      localStorage.setItem(`kb_portal_pending_profile_reqs_${reqCompKey}`, JSON.stringify(updated));

      setStep("pending_email_reset");
    }, 700);
  };

  const handleVerifyApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproverKey) {
      setError("Please select a sponsoring authority with a higher position.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const db = getStoredUsers();
      const approverName = selectedApproverKey.toLowerCase();
      const approver = db[approverName];
      const approverFullName = approver ? approver.name : selectedApproverKey;

      const reqCompKey = verifiedCompany.trim().toLowerCase() || "ekaba";
      const approvals: PendingApprovalRequest[] = JSON.parse(
        localStorage.getItem(`kb_portal_pending_approvals_${reqCompKey}`) || "[]",
      );

      // Clean up past entries with same name to avoid duplicates
      const updated = approvals.filter(
        (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
      );

      const newRequest: PendingApprovalRequest = {
        id: `req-${Date.now()}`,
        name: customName.trim(),
        domain: customEmail.trim(),
        role: selectedRole,
        sponsorName: approverFullName,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      updated.push(newRequest);
      localStorage.setItem(`kb_portal_pending_approvals_${reqCompKey}`, JSON.stringify(updated));

      setStep("pending_approval");
    }, 700);
  };

  const handleVerifyCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const cName = companyName.trim().toLowerCase();
    const authId = authorizedId.trim();

    const details = authorizedCompanies[cName];
    const expectedId = typeof details === "string" ? details : details?.authorizedClientId;
    if (expectedId && expectedId === authId) {
      setVerifiedCompany(companyName.trim());
      setStep("credentials");
      setError("");
    } else {
      setError(
        "Invalid Company Name or Authorized ID. Please use one of the pre-authorized codes shown below.",
      );
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please provide a password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      const db = getStoredUsers();
      const lowerName = customName.trim().toLowerCase();

      if (passwordMode === "create") {
        // Store and persist the user name and password inside LocalStorage
        db[lowerName] = {
          name: customName.trim(),
          domain: customDomain.trim(),
          password: password,
          role: selectedRole,
          email: customEmail.trim(),
        };
        saveStoredUsers(db);
      } else {
        // Existing user verification
        const userRec = db[lowerName];
        if (!userRec) {
          setError("User profile not found. Please re-enter credentials.");
          setStep("credentials");
          return;
        }
        if (userRec.password !== password) {
          setError("Authorization failed. The password provided is incorrect.");
          return;
        }
      }

      const initials =
        customName
          .split(" ")
          .map((n) => n[0])
          .filter(Boolean)
          .join("")
          .substring(0, 2)
          .toUpperCase() || "EE";

      const constructedEmail =
        customEmail.trim() ||
        (lowerName === "pranav jain"
          ? "jainpranav1707@gmail.com"
          : customDomain.includes("@")
            ? customDomain.trim()
            : customName.trim().toLowerCase().replace(/\s+/g, ".") + "@" + customDomain.trim());

      const userId = `u-${lowerName.replace(/\s+/g, "-") || Date.now()}`;

      const userPayload: User = {
        id: userId,
        name: customName.trim(),
        email: constructedEmail,
        role: selectedRole,
        avatar: initials,
      };

      // Register or sync user with backend server database
      fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userPayload,
          password: password,
          domain: customDomain.trim(),
          company: verifiedCompany,
        }),
      })
        .then(() => onLoginSuccess(userPayload, verifiedCompany))
        .catch((err) => {
          console.error("Backend registration error:", err);
          onLoginSuccess(userPayload, verifiedCompany); // fallback to offline success
        });
    }, 650);
  };

  return (
    <div
      id="login_container"
      className="min-h-screen w-full relative bg-background text-foreground overflow-hidden flex flex-col"
    >
      {/* Absolute Decorative ambient lights for premium warm theme */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full hero-orb-1 blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full hero-orb-2 blur-3xl opacity-20 pointer-events-none" />

      {/* Absolute Header with compliance metadata */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs text-muted-foreground font-mono z-20">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-semibold tracking-wide">
            FIPS 140-2 ENCRYPTED SECURE INFRASTRUCTURE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cycleTheme}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 hover:opacity-90 shadow-sm"
            style={{
              backgroundColor: 'var(--portal-badge-bg)',
              border: '1px solid var(--portal-badge-border)',
              color: 'var(--portal-badge-fg)',
            }}
            aria-label="Cycle color theme"
            title={`Current: ${THEME_LABELS[theme]}. Click to switch.`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>{THEME_LABELS[theme]}</span>
          </button>
          <div className="hidden sm:block font-medium">STATUS: ONLINE / SECURED</div>
        </div>
      </div>

      <div className="w-full min-h-screen grid md:grid-cols-12 bg-background overflow-hidden relative z-10">
        {/* Left Hand: Corporate Context (Dark Ink & Grid Theme with beautifully visible office image) */}
        <div className="md:col-span-5 relative bg-[#0e1117] grid-bg noise p-6 md:p-12 flex flex-col justify-between overflow-hidden text-slate-100 min-h-[450px] border-r border-slate-900">
          {/* Neon accent orbs inside dark panel */}
          <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-10 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

          <div className="space-y-8 mt-12 md:mt-8 relative z-10">
            <div className="flex items-center gap-3">
              <img src="/ekaba-bot.jpg" alt="EKABA Bot" className="h-10 w-10 rounded-lg object-cover shadow-md shadow-primary/20" />
              <div>
                <h2 className="font-display font-semibold text-lg text-slate-100 tracking-tight leading-none">
                  EKABA
                </h2>
                <p className="text-slate-400 text-[10px] font-mono mt-1">
                  SECURE INTEGRATED PORTAL
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100 leading-tight">
                Knowledge Base <span className="shimmer-text">Assistant</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Unlock segmented document intelligence across policies, spreadsheets, procedures,
                and handbook guidelines with secure, role-based semantic RAG search.
              </p>
            </div>

            <SecurityVault3D />
          </div>

          {verifiedCompany && (
            <div className="border-t border-slate-900 pt-6 mt-6">
              <span className="text-[10px] uppercase font-mono text-primary block mb-2 px-1 tracking-widest font-bold">
                Select Persona Access
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                {(Object.keys(demoUsers) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setError("");
                      setStep("credentials");
                      try {
                        const db = getStoredUsers();
                        const matchedUser = Object.values(db).find((user) => user.role === role);
                        if (matchedUser && role === "Owner") {
                          setCustomName(matchedUser.name);
                          setCustomDomain(matchedUser.domain);
                          const initialEmail =
                            matchedUser.email ||
                            (matchedUser.name.toLowerCase() === "pranav jain"
                              ? "jainpranav1707@gmail.com"
                              : matchedUser.domain.includes("@")
                                ? matchedUser.domain
                                : matchedUser.name.trim().toLowerCase().replace(/\s+/g, ".") +
                                  "@" +
                                  matchedUser.domain);
                          setCustomEmail(initialEmail);
                        } else {
                          setCustomName("");
                          setCustomDomain("");
                          setCustomEmail("");
                        }
                      } catch (e) {
                        setCustomName("");
                        setCustomDomain("");
                        setCustomEmail("");
                      }
                    }}
                    className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedRole === role
                        ? "bg-primary/20 border-primary text-white shadow-md"
                        : "bg-stone-900/40 border-stone-800 hover:bg-stone-900/80 text-stone-300 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-semibold text-center truncate">{role}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Hand: Action Form (Warm clean layout, styled with rich bronze and charcoal) */}
        <div className="md:col-span-7 bg-background p-6 sm:p-12 md:p-16 flex flex-col justify-between space-y-8 min-h-screen">
          <div className="space-y-8 my-auto max-w-xl w-full mx-auto glass-card p-8 rounded-2xl border border-border/60 shadow-xl relative overflow-hidden">
            {/* Ambient card accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono text-stone-500 font-bold tracking-widest uppercase">
                    {step === "company_verification"
                      ? "EKABA Client Activation"
                      : verifiedCompany
                        ? `${verifiedCompany} Access Channel`
                        : "SSO SECURE INTERCONNECTED CHANNEL"}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-stone-800 mt-1">
                    {step === "company_verification"
                      ? "Client Identity Verification"
                      : step === "credentials"
                        ? "Single Sign-On Activation"
                        : step === "permission"
                          ? "Authority Sponsoring Clearance"
                          : passwordMode === "create"
                            ? "Create Secure Password"
                            : "Verify Password"}
                  </h2>
                </div>
                {step === "company_verification" ? (
                  <button
                    type="button"
                    onClick={cycleTheme}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 hover:opacity-90 shadow-sm shrink-0"
                    style={{
                      backgroundColor: 'var(--portal-badge-bg)',
                      border: '1px solid var(--portal-badge-border)',
                      color: 'var(--portal-badge-fg)',
                    }}
                    aria-label="Cycle color theme"
                    title={`Current: ${THEME_LABELS[theme]}. Click to switch.`}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>{THEME_LABELS[theme]}</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={cycleTheme}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 hover:opacity-90 shadow-sm"
                      style={{
                        backgroundColor: 'var(--portal-badge-bg)',
                        border: '1px solid var(--portal-badge-border)',
                        color: 'var(--portal-badge-fg)',
                      }}
                      aria-label="Cycle color theme"
                      title={`Current: ${THEME_LABELS[theme]}. Click to switch.`}
                    >
                      <Palette className="h-3.5 w-3.5" />
                      <span>{THEME_LABELS[theme]}</span>
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-100 text-amber-850">
                      <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                      {selectedRole}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("company_verification");
                        setError("");
                      }}
                      className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-2 py-1 rounded-lg transition"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change Client</span>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3.5 text-xs flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {step === "company_verification" ? (
                <form onSubmit={handleVerifyCompany} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 font-sans">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-4 text-sm text-stone-850 focus:outline-none placeholder:text-stone-400 transition-all shadow-inner"
                      placeholder="e.g. Google"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 font-sans">
                      Authorized Client ID
                    </label>
                    <input
                      type="text"
                      required
                      value={authorizedId}
                      onChange={(e) => {
                        setAuthorizedId(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-4 text-sm text-stone-850 focus:outline-none placeholder:text-stone-400 transition-all shadow-inner font-mono"
                      placeholder="e.g. GOOG-EKABA-99"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3.5 px-4 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] mt-4"
                  >
                    <span>Verify Client Identity</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : step === "credentials" ? (
                <form onSubmit={handleSendCredentials} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-stone-600">Enter Name</label>
                      <span className="text-[9px] text-amber-700 font-mono font-bold tracking-wider">
                        CUSTOM PROFILE
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-4 text-sm text-stone-850 focus:outline-none placeholder:text-stone-400 transition-all shadow-inner"
                      placeholder={`Enter ${selectedRole.toLowerCase()} name`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-stone-600 font-sans">
                        Enter Email Address
                      </label>
                      <span className="text-[9px] text-amber-700 font-mono font-bold uppercase tracking-wider">
                        Required
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value.trim());
                        setError("");
                      }}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-4 text-sm text-stone-800 focus:outline-none placeholder:text-stone-400 transition-all shadow-inner"
                      placeholder="e.g. employee@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 font-sans">
                      EKABA Identity Provider (IDP)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={getIdpForRole(selectedRole)}
                      className="w-full bg-stone-100 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-500 focus:outline-none cursor-not-allowed font-medium select-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3.5 px-4 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.98] mt-4"
                  >
                    {loading ? "Decrypting SSO Token..." : "Authorize via SSO IDP"}
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  {isEmailMismatch && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep("email_reset");
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 px-4 font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] mt-2"
                    >
                      <KeyRound className="w-4.5 h-4.5 text-white animate-pulse" />
                      <span>Request Email Reset Clearance</span>
                    </button>
                  )}
                </form>
              ) : step === "permission" ? (
                <form onSubmit={handleVerifyApproval} className="space-y-6">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs space-y-2 text-stone-700">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-amber-600 animate-pulse" />
                      Sponsoring Clearance Required
                    </div>
                    <p className="leading-relaxed">
                      To register <strong>{customName}</strong> as a new{" "}
                      <strong>{selectedRole}</strong>, an authorized office holder with a higher
                      position must grant SSO activation inside their system dashboard.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 block">
                      Sponsoring Authority
                    </label>
                    {getEligibleApprovers(selectedRole).length === 0 ? (
                      <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 text-xs text-stone-500 font-medium font-mono uppercase">
                        Pranav Jain (Owner) override applies.
                      </div>
                    ) : (
                      <select
                        value={selectedApproverKey}
                        onChange={(e) => {
                          setSelectedApproverKey(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-3 text-xs text-stone-800 font-semibold focus:outline-none transition-all shadow-inner"
                      >
                        {getEligibleApprovers(selectedRole).map((user) => (
                          <option key={user.name.toLowerCase()} value={user.name.toLowerCase()}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600 space-y-1.5 font-sans leading-relaxed">
                    <p>
                      📌 <strong>How it works:</strong> Your registration request will be dispatched
                      directly to your sponsoring authority. They will see a real-time pending
                      notification in their <strong>Dashboard Console</strong> where they can
                      instantly approve your clearance.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setError("");
                      }}
                      className="bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-3 font-semibold text-xs text-stone-550 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md"
                    >
                      {loading ? "Routing Request..." : "Dispatch Approval Request"}
                    </button>
                  </div>
                </form>
              ) : step === "pending_approval" ? (
                <div className="space-y-6">
                  <div className="bg-amber-50/55 border border-amber-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-subtle-pulse">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                      <Shield className="w-5 h-5 text-amber-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-stone-800 font-display tracking-wide">
                        Security Clearance Dispatcher
                      </h3>
                      <p className="inline-block text-[9px] font-mono text-amber-700 font-bold uppercase tracking-widest bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded">
                        Awaiting Sign-Off
                      </p>
                    </div>

                    <p className="text-stone-600 text-xs leading-relaxed max-w-sm">
                      SSO clearance request for{" "}
                      <strong className="text-stone-800">{customName}</strong> has been transmitted
                      to your chosen authority's live dashboard console.
                    </p>

                    <div className="border-t border-amber-200/50 pt-3 w-full font-mono text-[9px] text-amber-700 space-y-1">
                      <div>CHANNEL STATUS: ACTIVE SECURE POLLING (1.5s)</div>
                      <div>IDENTITY PROVIDER: {getIdpForRole(selectedRole).toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const cancelCompKey = verifiedCompany.trim().toLowerCase() || "ekaba";
                        const approvals: PendingApprovalRequest[] = JSON.parse(
                          localStorage.getItem(`kb_portal_pending_approvals_${cancelCompKey}`) ||
                            "[]",
                        );
                        const updated = approvals.filter(
                          (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
                        );
                        localStorage.setItem(
                          `kb_portal_pending_approvals_${cancelCompKey}`,
                          JSON.stringify(updated),
                        );
                        setStep("credentials");
                        setError("");
                      }}
                      className="bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2 px-6 font-semibold text-xs text-stone-500 transition-colors cursor-pointer shadow-sm"
                    >
                      Cancel Registration Request
                    </button>
                  </div>
                </div>
              ) : step === "email_reset" ? (
                <form onSubmit={handleSendEmailResetRequest} className="space-y-6">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs space-y-2 text-stone-700">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-amber-600 animate-pulse" />
                      Email Reset Sponsoring Required
                    </div>
                    <p className="leading-relaxed">
                      To change the registered email for <strong>{customName}</strong>, an
                      authorized office holder with a higher position must grant SSO verification
                      inside their system dashboard.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 block">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value.trim());
                        setError("");
                      }}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-4 text-sm text-stone-800 focus:outline-none placeholder:text-stone-400 transition-all shadow-inner"
                      placeholder="Enter new email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-600 block">
                      Sponsoring Authority (Upper Post)
                    </label>
                    {getEligibleApprovers(selectedRole).length === 0 ? (
                      <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 text-xs text-stone-500 font-medium font-mono uppercase">
                        Pranav Jain (Owner) override applies.
                      </div>
                    ) : (
                      <select
                        value={selectedApproverKey}
                        onChange={(e) => {
                          setSelectedApproverKey(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-3 px-3 text-xs text-stone-850 font-semibold focus:outline-none transition-all shadow-inner"
                      >
                        {getEligibleApprovers(selectedRole).map((user) => (
                          <option key={user.name.toLowerCase()} value={user.name.toLowerCase()}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setError("");
                      }}
                      className="bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-3 font-semibold text-xs text-stone-550 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md"
                    >
                      {loading ? "Routing Request..." : "Request Reset"}
                    </button>
                  </div>
                </form>
              ) : step === "pending_email_reset" ? (
                <div className="space-y-6">
                  <div className="bg-amber-50/55 border border-amber-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-subtle-pulse">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                      <Shield className="w-5 h-5 text-amber-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-stone-800 font-display tracking-wide">
                        Email Reset Clearance Dispatcher
                      </h3>
                      <p className="inline-block text-[9px] font-mono text-amber-700 font-bold uppercase tracking-widest bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded">
                        Awaiting Upper Post Sign-Off
                      </p>
                    </div>

                    <p className="text-stone-600 text-xs leading-relaxed max-w-sm">
                      An authorization request to update the email address of{" "}
                      <strong className="text-stone-850">{customName}</strong> to{" "}
                      <strong className="text-stone-850">{customEmail}</strong> is being processed.
                      Sponsoring clearance is required.
                    </p>

                    <div className="border-t border-amber-200/50 pt-3 w-full font-mono text-[9px] text-amber-700 space-y-1">
                      <div>CHANNEL STATUS: ACTIVE SECURE POLLING (1.5s)</div>
                      <div>SPONSORING AUTHORITY: {selectedApproverKey.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const cancelCompKey = verifiedCompany.trim().toLowerCase() || "ekaba";
                        const profileReqs: PendingProfileRequest[] = JSON.parse(
                          localStorage.getItem(`kb_portal_pending_profile_reqs_${cancelCompKey}`) ||
                            "[]",
                        );
                        const updated = profileReqs.filter(
                          (req) => req.userName.toLowerCase() !== customName.trim().toLowerCase(),
                        );
                        localStorage.setItem(
                          `kb_portal_pending_profile_reqs_${cancelCompKey}`,
                          JSON.stringify(updated),
                        );
                        setStep("credentials");
                        setError("");
                      }}
                      className="bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-2 px-6 font-semibold text-xs text-stone-500 transition-colors cursor-pointer shadow-sm"
                    >
                      Cancel Reset Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyPassword} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-stone-600">
                        {passwordMode === "create" ? "Create New Password" : "Enter Password"}
                      </label>
                      <span className="text-[10px] text-amber-700 font-mono font-bold uppercase">
                        {passwordMode === "create"
                          ? "FIRST-TIME REGISTRATION"
                          : "SECURE VERIFICATION"}
                      </span>
                    </div>

                    {passwordMode === "create" ? (
                      <div className="space-y-2">
                        <p className="text-xs text-stone-500 leading-relaxed">
                          First-time login detected for <strong>{customName}</strong>. Please
                          establish a secure password to register your profile as a{" "}
                          <strong>{selectedRole}</strong>.
                        </p>
                        {sponsorInfo && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 font-mono text-[9px] text-emerald-800 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            {sponsorInfo.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Welcome back! Please enter the password associated with{" "}
                        {selectedRole.toLowerCase()} name <strong>{customName}</strong> to authorize
                        your session.
                      </p>
                    )}

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-450 font-bold" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          passwordMode === "create"
                            ? "Create your new secure password"
                            : "Enter registered password"
                        }
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-white border border-stone-200 focus:border-amber-600 rounded-xl py-3 pl-11 pr-12 text-sm text-stone-800 focus:outline-none placeholder:text-stone-300 shadow-inner transition-all focus:ring-1 focus:ring-amber-600"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer focus:outline-none p-1 flex items-center justify-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setError("");
                      }}
                      className="bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-3 font-semibold text-xs text-stone-500 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md"
                    >
                      {loading
                        ? passwordMode === "create"
                          ? "Registering..."
                          : "Verifying..."
                        : passwordMode === "create"
                          ? "Create & Sign In"
                          : "Complete Sign In"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="text-center text-[10px] text-muted-foreground border-t border-border/60 pt-4 font-mono tracking-wider">
            COMPLIANCE SECURE: GDPR & SOC-2 CERTIFIED INTERCONNECTED INSTANCE
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. Portal Page router component
// ==========================================
export const Route = createFileRoute("/portal")({
  component: PortalPage,
});

type ActiveTab = "dashboard" | "chat" | "documents" | "admin" | "profile" | "activity";

function PortalPage() {
  const { theme, toggleTheme, cycleTheme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);

  // Global list of authorized companies and subscription details
  const [authorizedCompanies, setAuthorizedCompanies] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchCompanies = () => {
      fetch("/api/authorized-companies")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) setAuthorizedCompanies(data);
        })
        .catch((err) => console.error("Error loading authorized companies:", err));
    };

    fetchCompanies();
    const interval = setInterval(fetchCompanies, 5000);
    return () => clearInterval(interval);
  }, []);

  // Global Undo state
  const [undoToast, setUndoToast] = useState<{
    id: string;
    message: string;
    onUndo: () => void;
    onConfirm?: () => void;
  } | null>(null);

  const triggerUndo = (message: string, onUndo: () => void, onConfirm?: () => void) => {
    const id = Math.random().toString();
    setUndoToast({ id, message, onUndo, onConfirm });

    // Set a timer for 3 seconds
    setTimeout(() => {
      setUndoToast((current) => {
        if (current && current.id === id) {
          if (current.onConfirm) {
            current.onConfirm();
          }
          return null;
        }
        return current;
      });
    }, 3000);
  };

  const handleUndoClick = () => {
    if (undoToast) {
      undoToast.onUndo();
      setUndoToast(null);
    }
  };

  const handleLoginSuccess = (user: User, company: string) => {
    setCurrentUser(user);
    setCurrentCompany(company || "EKABA");
    setActiveTab("dashboard");
    logUserActivity(user.id, user.name, "Logged in successfully via SSO");
  };

  const handleLogout = () => {
    if (currentUser) {
      logUserActivity(currentUser.id, currentUser.name, "Logged out of workspace session");
    }
    setCurrentUser(null);
    setActiveTab("dashboard");
    setInitialChatQuery(undefined);
  };

  const handleNavigateToChat = (query?: string) => {
    if (query) {
      setInitialChatQuery(query);
    }
    setActiveTab("chat");
  };

  const handleUpdateCurrentUserRole = (newRole: UserRole) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
      });
    }
  };

  const handleUpdateCurrentUser = (email: string, name?: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        email,
        ...(name ? { name } : {}),
      });
    }
  };

  // If user is not authenticated, render standard SSO login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Check if current user role has permission to access Admin parameters
  const isITAdmin = currentUser.role !== "Employee";

  // Check subscription details for lockout
  const isEkabaUser =
    currentCompany.toLowerCase().trim().includes("ekaba") ||
    (currentUser?.email || "").endsWith("@ekaba.com");

  const companyDetails = authorizedCompanies[currentCompany.toLowerCase().trim()];
  let subscriptionStatus: "plan_active" | "demo_active" | "expired" = "demo_active";

  if (companyDetails) {
    const now = new Date();
    if (companyDetails.planExpiresAt) {
      const planExpires = new Date(companyDetails.planExpiresAt);
      if (now <= planExpires) {
        subscriptionStatus = "plan_active";
      } else {
        subscriptionStatus = "expired";
      }
    } else if (companyDetails.demoExpiresAt) {
      const demoExpires = new Date(companyDetails.demoExpiresAt);
      if (now <= demoExpires) {
        subscriptionStatus = "demo_active";
      } else {
        subscriptionStatus = "expired";
      }
    } else {
      subscriptionStatus = "expired";
    }
  }

  const isLocked = subscriptionStatus === "expired" && !isEkabaUser;

  return (
    <div
      id="workspace_parent"
      className="min-h-screen flex font-sans w-full"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Sleek Enterprise Left Sidebar Navigation */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col justify-between shadow-xl hidden md:flex transition-colors duration-300"
        style={{
          backgroundColor: 'var(--portal-sidebar-bg)',
          color: 'var(--portal-sidebar-fg)',
          borderRight: '1px solid var(--portal-sidebar-border)',
        }}
      >
        <div className="space-y-6 py-6">
          {/* Logo Section */}
          <div className="px-6 flex items-center gap-3">
            <img src="/ekaba-bot.jpg" alt="EKABA Bot" className="h-9 w-9 rounded-xl object-cover shadow-sm" style={{ border: '1px solid color-mix(in oklch, var(--portal-sidebar-active-bg) 25%, transparent)' }} />
            <div>
              <h1
                className="font-display font-bold text-sm tracking-tight leading-none"
                style={{ color: 'var(--portal-sidebar-fg)' }}
              >
                {formatCompanyName(currentCompany)} Portal
              </h1>
              <span
                className="text-[9px] font-mono font-medium uppercase tracking-wider block mt-1"
                style={{ color: 'var(--portal-sidebar-muted)' }}
              >
                EKABA RAG Assistant
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1.5">
            {[
              { key: 'dashboard' as ActiveTab, icon: LayoutDashboard, label: 'Dashboard Console', locked: isLocked },
              { key: 'chat' as ActiveTab, icon: MessageSquare, label: 'मां', locked: isLocked },
              { key: 'documents' as ActiveTab, icon: BookOpen, label: 'Document Center', locked: isLocked },
              { key: 'profile' as ActiveTab, icon: Shield, label: 'Profile Security', locked: false },
              { key: 'activity' as ActiveTab, icon: Clock, label: 'Activity Logs', locked: isLocked },
              { key: 'admin' as ActiveTab, icon: Settings, label: 'Admin Auditer', locked: !isITAdmin || isLocked },
            ].map(({ key, icon: Icon, label, locked }) => {
              const isActive = activeTab === key && !locked;
              return (
                <button
                  key={key}
                  onClick={() => !locked && setActiveTab(key)}
                  disabled={locked}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--portal-sidebar-active-bg)' : 'transparent',
                    color: isActive ? 'var(--portal-sidebar-active-fg)' : 'var(--portal-sidebar-fg)',
                    ...(isActive ? { fontWeight: 700, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !locked) {
                      e.currentTarget.style.backgroundColor = 'var(--portal-sidebar-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !locked) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  {locked && key === 'admin' && (
                    <Lock className="w-3 h-3" style={{ color: 'var(--portal-sidebar-muted)' }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity bottom widget & Sign Out */}
        <div
          className="p-4 space-y-4 transition-colors duration-300"
          style={{
            borderTop: '1px solid var(--portal-sidebar-border)',
            backgroundColor: 'var(--portal-sidebar-bottom-bg)',
          }}
        >
          <div
            className="flex items-center gap-3 p-2 rounded-xl"
            style={{ backgroundColor: 'color-mix(in oklch, var(--portal-sidebar-bg) 60%, transparent)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs"
              style={{
                backgroundColor: 'var(--portal-sidebar-avatar-bg)',
                color: 'var(--portal-sidebar-avatar-fg)',
                border: '1px solid var(--portal-sidebar-border)',
              }}
            >
              {currentUser.avatar || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: 'var(--portal-sidebar-fg)' }}>
                {currentUser.name}
              </div>
              <div
                className="text-[9px] font-mono font-semibold uppercase tracking-wider truncate mt-0.5"
                style={{ color: 'var(--portal-sidebar-active-bg)' }}
              >
                {currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all hover:text-rose-400 cursor-pointer"
            style={{
              backgroundColor: 'var(--portal-sidebar-signout-bg)',
              border: '1px solid var(--portal-sidebar-signout-border)',
              color: 'var(--portal-sidebar-muted)',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Single SSO</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Rail with Mobile Drawer hooks */}
        <header
          className="backdrop-blur-md p-4 flex justify-between items-center transition-colors duration-300"
          style={{
            backgroundColor: 'var(--portal-header-bg)',
            borderBottom: '1px solid var(--portal-header-border)',
          }}
        >
          <div className="flex items-center gap-3 md:hidden">
            <img src="/ekaba-bot.jpg" alt="EKABA Bot" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <h1 className="font-display font-bold text-sm" style={{ color: 'var(--foreground)' }}>EKABA Assistant</h1>
          </div>

          {/* Theme Cycle & welcome status */}
          <div className="flex items-center gap-4">
            <button
              onClick={cycleTheme}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
              style={{
                backgroundColor: 'var(--portal-badge-bg)',
                border: '1px solid var(--portal-badge-border)',
                color: 'var(--portal-badge-fg)',
              }}
              aria-label="Cycle color theme"
              title={`Current: ${THEME_LABELS[theme]}. Click to switch.`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
            </button>

            {/* Desktop welcome status */}
            <div
              className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--portal-badge-bg)',
                border: '1px solid var(--portal-badge-border)',
                color: 'var(--portal-badge-fg)',
              }}
            >
              <UserCircle className="w-4 h-4" style={{ color: 'var(--portal-sidebar-muted)' }} />
              <span>ROLE PROFILE ACTIVE:</span>
              <span className="font-mono font-bold uppercase" style={{ color: 'var(--portal-sidebar-active-bg)' }}>{currentUser.role}</span>
            </div>
          </div>

          {/* Mobile responsive Quick Tabs selector bar */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => !isLocked && setActiveTab("dashboard")}
              disabled={isLocked}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "dashboard" && !isLocked ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"} ${isLocked ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => !isLocked && setActiveTab("chat")}
              disabled={isLocked}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "chat" && !isLocked ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"} ${isLocked ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Chat
            </button>
            <button
              onClick={() => !isLocked && setActiveTab("documents")}
              disabled={isLocked}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "documents" && !isLocked ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"} ${isLocked ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Files
            </button>
            <button
              onClick={() => !isLocked && setActiveTab("activity")}
              disabled={isLocked}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "activity" && !isLocked ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"} ${isLocked ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Logs
            </button>

            {isITAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`p-2 rounded-lg text-xs font-bold ${activeTab === "admin" ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"}`}
              >
                Admin
              </button>
            )}
          </div>

          {/* Sign Out Hook for Mobile devices */}
          <button
            onClick={handleLogout}
            className="md:hidden text-slate-400 hover:text-rose-600 p-1.5"
            title="Log Out SSO"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable page section contents */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {isLocked ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-6 min-h-[70vh]">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-lg animate-bounce">
                <Lock className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-800">
                  Subscription / Demo Expired
                </h2>
                <p className="text-rose-600 font-semibold text-lg font-mono">
                  your demo period is over now renew it
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md w-full text-left space-y-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">
                  Account Representative
                </h4>
                {companyDetails?.employeeName ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Please contact your assigned representative to renew your subscription plan:
                    </p>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {companyDetails.employeeName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {companyDetails.employeeName}
                        </div>
                        <div className="text-xs text-slate-550 font-mono">
                          {companyDetails.employeeEmail}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Please contact EKABA Support to renew your subscription plan:
                    </p>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        E
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          EKABA Corporate Support
                        </div>
                        <div className="text-xs text-slate-550 font-mono">support@ekaba.com</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  currentUser={currentUser}
                  onNavigateToChat={handleNavigateToChat}
                  companyName={currentCompany}
                />
              )}

              {activeTab === "chat" && (
                <ChatInterface
                  currentUser={currentUser}
                  initialQuery={initialChatQuery}
                  onClearInitialQuery={() => setInitialChatQuery(undefined)}
                  companyName={currentCompany}
                />
              )}

              {activeTab === "documents" && (
                <DocumentCenter
                  currentUser={currentUser}
                  triggerUndo={triggerUndo}
                  companyName={currentCompany}
                />
              )}

              {activeTab === "profile" && (
                <ProfileSettings
                  currentUser={currentUser}
                  onUpdateCurrentUser={handleUpdateCurrentUser}
                  companyName={currentCompany}
                />
              )}

              {activeTab === "activity" && (
                <ActivityLogs currentUser={currentUser} companyName={currentCompany} />
              )}

              {/* RBAC Security Block guard screen */}
              {activeTab === "admin" &&
                (isITAdmin ? (
                  <AdminPanel
                    currentUser={currentUser}
                    onUpdateCurrentUserRole={handleUpdateCurrentUserRole}
                    companyName={currentCompany}
                    triggerUndo={triggerUndo}
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-850">
                      Access Denied: Restricted Parameters
                    </h3>
                    <p className="text-slate-550 text-sm leading-relaxed">
                      Your current profile credentials level is restricted. Contact network
                      administrator or shift your role selector on the system dashboard to explore
                      IT Admin telemetry controls.
                    </p>
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 px-4 text-xs font-semibold transition"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ))}
            </>
          )}
        </main>
      </div>

      {/* Floating Global Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-slate-100 border border-slate-700/80 px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-bounce-in min-w-[280px] max-w-sm">
          <div className="flex-1 text-xs font-semibold text-slate-200">{undoToast.message}</div>
          <button
            onClick={handleUndoClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500 transition-all cursor-pointer shrink-0"
          >
            Undo (3s)
          </button>
        </div>
      )}
    </div>
  );
}
