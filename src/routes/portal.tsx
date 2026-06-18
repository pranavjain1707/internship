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
} from "lucide-react";
import { User, UserRole, ROLE_HIERARCHY, PendingApprovalRequest } from "../types";
import { useTheme } from "../components/ThemeProvider";
import Dashboard from "../components/portal/Dashboard";
import ChatInterface from "../components/portal/ChatInterface";
import DocumentCenter from "../components/portal/DocumentCenter";
import AdminPanel from "../components/portal/AdminPanel";
import ProfileSettings from "../components/portal/ProfileSettings";
import { isSupabaseConfigured } from "../lib/supabase";


// ==========================================
// 1. Full Page SSO Login Screen component
// ==========================================
const AUTHORIZED_COMPANIES: Record<string, string> = {
  "ekaba": "EKABA-TEAM-2026",
  "ekaba internal": "EKABA-TEAM-2026",
  "google": "GOOG-EKABA-99",
  "acme corp": "ACME-EKABA-12",
  "microsoft": "MSFT-EKABA-88",
  "apple": "AAPL-EKABA-77",
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
      { name: "Larry Page", domain: "google.com", password: "GoogleEmp@2026", role: "Employee" as UserRole },
      { name: "Sergey Brin", domain: "google.com", password: "GoogleMgr@2026", role: "Manager" as UserRole },
      { name: "Ruth Porat", domain: "google.com", password: "GoogleHR@2026", role: "HR Officer" as UserRole },
      { name: "Jeff Dean", domain: "google.com", password: "GoogleIT@2026", role: "IT Administrator" as UserRole },
    ];
  }
  if (c === "acme corp" || c === "acme") {
    return [
      { name: "Road Runner", domain: "acme.com", password: "AcmeEmp@2026", role: "Employee" as UserRole },
      { name: "Bugs Bunny", domain: "acme.com", password: "AcmeMgr@2026", role: "Manager" as UserRole },
      { name: "Daffy Duck", domain: "acme.com", password: "AcmeHR@2026", role: "HR Officer" as UserRole },
      { name: "Elmer Fudd", domain: "acme.com", password: "AcmeIT@2026", role: "IT Administrator" as UserRole },
    ];
  }
  if (c === "microsoft") {
    return [
      { name: "Bill Gates", domain: "microsoft.com", password: "MsftEmp@2026", role: "Employee" as UserRole },
      { name: "Paul Allen", domain: "microsoft.com", password: "MsftMgr@2026", role: "Manager" as UserRole },
      { name: "Steve Ballmer", domain: "microsoft.com", password: "MsftHR@2026", role: "HR Officer" as UserRole },
      { name: "Kevin Scott", domain: "microsoft.com", password: "MsftIT@2026", role: "IT Administrator" as UserRole },
    ];
  }
  if (c === "apple") {
    return [
      { name: "Steve Jobs", domain: "apple.com", password: "AppleEmp@2026", role: "Employee" as UserRole },
      { name: "Steve Wozniak", domain: "apple.com", password: "AppleMgr@2026", role: "Manager" as UserRole },
      { name: "Craig Federighi", domain: "apple.com", password: "AppleHR@2026", role: "HR Officer" as UserRole },
      { name: "Phil Schiller", domain: "apple.com", password: "AppleIT@2026", role: "IT Administrator" as UserRole },
    ];
  }
  return [
    { name: "Alice Smith", domain: "ekaba.com", password: "Password@123", role: "Employee" as UserRole },
    { name: "John Doe", domain: "ekaba.com", password: "Password@123", role: "Manager" as UserRole },
    { name: "Sarah Connor", domain: "ekaba.com", password: "Password@123", role: "HR Officer" as UserRole },
    { name: "Dave Miller", domain: "ekaba.com", password: "Password@123", role: "IT Administrator" as UserRole },
  ];
};

interface LoginScreenProps {
  onLoginSuccess: (user: User, company: string) => void;
}

function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Employee");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"company_verification" | "credentials" | "permission" | "pending_approval" | "password" | "email_reset" | "pending_email_reset">(
    "company_verification",
  );
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
              localStorage.setItem(`kb_portal_pending_approvals_${pollCompKey}`, JSON.stringify(updated));
            } else if (myReq && myReq.status === "rejected") {
              setError(
                `Your clearance request has been rejected by ${myReq.approvedBy || myReq.sponsorName}.`,
              );
              setStep("credentials");

              // Clean up request
              const updated = approvals.filter(
                (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
              );
              localStorage.setItem(`kb_portal_pending_approvals_${pollCompKey}`, JSON.stringify(updated));
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
              (req) => req.userName.toLowerCase() === customName.trim().toLowerCase() && req.status !== "pending",
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
                setError(`Your email reset request was rejected by ${myReq.approvedBy || myReq.sponsorName}.`);
                setStep("credentials");
              }

              // Remove request from pending queue
              const updated = profileReqs.filter((r) => r.id !== myReq.id);
              localStorage.setItem(`kb_portal_pending_profile_reqs_${pollCompKey}`, JSON.stringify(updated));
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
        // Overwrite local credentials db if Supabase is active to support deletes properly
        const merged = isSupabaseConfigured ? backendDb : { ...localDb, ...backendDb };
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
    const kickedUsersStr = localStorage.getItem(`kb_portal_kicked_users_${storedUsersCompKey}`) || "[]";
    let kickedUsers: string[] = [];
    try {
      kickedUsers = JSON.parse(kickedUsersStr);
    } catch (e) {}

    // When connected to Supabase, we do not want to auto-create mock users locally
    if (isSupabaseConfigured) {
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          return {};
        }
      }
      return {};
    }

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

  const handleSendCredentials = (e: React.FormEvent) => {
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

    const processWithDb = (db: Record<string, StoredUser>) => {
      setLoading(false);
      const lowerName = customName.trim().toLowerCase();

      if (db[lowerName]) {
        // Existing registered user
        const registered = db[lowerName];
        
        // Calculate the expected email for this user
        const expectedEmail = registered.email || (
          registered.name.toLowerCase() === "pranav jain"
            ? "jainpranav1707@gmail.com"
            : registered.domain.includes("@")
              ? registered.domain
              : registered.name.trim().toLowerCase().replace(/\s+/g, ".") + "@" + registered.domain
        );

        if (customEmail.trim().toLowerCase() === expectedEmail.toLowerCase()) {
          // Email matches! Require password verification
          setIsEmailMismatch(false);
          setPasswordMode("enter");
          setSelectedRole(registered.role as UserRole);
          setCustomDomain(registered.domain);
          setPassword("");
          setStep("password");
        } else {
          // Email mismatch! Show warning and button to reset email
          setIsEmailMismatch(true);
          setError(`Email address does not match the registered record for "${registered.name}". Please check the spelling or request an email reset.`);
        }
      } else {
        // First-time user registration
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
    };

    // Always fetch latest user DB from the server API at login time.
    // This prevents stale localStorage causing registered users to be treated as new.
    // Server-side always has access to env vars at runtime, even if VITE_* vars
    // were not baked into the frontend bundle during build time.
    const compKey = verifiedCompany.trim().toLowerCase() || "ekaba";
    fetch(`/api/users/db?company=${encodeURIComponent(compKey)}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("DB fetch failed");
      })
      .then((backendDb) => {
        // Merge server db with local (server takes priority for existing keys)
        const localDb = getStoredUsers();
        const merged = { ...localDb, ...backendDb };
        saveStoredUsers(merged, verifiedCompany);
        processWithDb(merged);
      })
      .catch(() => {
        // Fallback to cached localStorage if server API call fails
        setTimeout(() => processWithDb(getStoredUsers()), 300);
      });
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

    const expectedId = AUTHORIZED_COMPANIES[cName];
    if (expectedId && expectedId === authId) {
      setVerifiedCompany(companyName.trim());
      setStep("credentials");
      setError("");
    } else {
      setError("Invalid Company Name or Authorized ID. Please use one of the pre-authorized codes shown below.");
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
        customEmail.trim() || (
        lowerName === "pranav jain"
          ? "jainpranav1707@gmail.com"
          : customDomain.includes("@")
            ? customDomain.trim()
            : customName.trim().toLowerCase().replace(/\s+/g, ".") + "@" + customDomain.trim()
        );

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
      className="min-h-screen w-full relative bg-[#FCFAF6] text-slate-800 overflow-hidden flex flex-col"
    >
      {/* Absolute Decorative ambient lights for premium warm theme */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-100/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Absolute Header with compliance metadata */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs text-stone-500 font-mono z-20">
        <div className="flex items-center gap-2 text-stone-400">
          <Shield className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="font-semibold tracking-wide">
            FIPS 140-2 ENCRYPTED SECURE INFRASTRUCTURE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-1.5 hover:bg-stone-200 dark:hover:bg-stone-850 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="hidden sm:block font-medium text-stone-400">STATUS: ONLINE / SECURED</div>
        </div>
      </div>

      <div className="w-full min-h-screen grid md:grid-cols-12 bg-white overflow-hidden relative z-10">
        {/* Left Hand: Corporate Context (Dark Ink & Grid Theme with beautifully visible office image) */}
        <div className="md:col-span-5 relative bg-[#0e1117] grid-bg noise p-6 md:p-12 flex flex-col justify-between overflow-hidden text-slate-100 min-h-[450px] border-r border-slate-900">
          <div className="space-y-8 mt-12 md:mt-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-lg shadow-md shadow-primary/20">
                <span className="leading-none">E</span>
              </div>
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
                Knowledge Base Assistant
              </h1>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Unlock segmented document intelligence across policies, spreadsheets, procedures,
                and handbook guidelines with secure, role-based semantic RAG search.
              </p>
            </div>

            {/* High-fidelity corporate building/office illustration card - SHARP & CLEARLY VISIBLE */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-900 bg-slate-950/60 aspect-[16/10] shadow-lg group">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                alt="EKABA Corporate Headquarters"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 saturate-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-[9px] font-mono font-bold text-primary tracking-widest uppercase">
                  Federated Office Server Node
                </span>
                <p className="text-xs text-slate-200 font-bold">
                  Secure Headquarters & RAG Gateway
                </p>
              </div>
            </div>
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
                          const initialEmail = matchedUser.email || (
                            matchedUser.name.toLowerCase() === "pranav jain"
                              ? "jainpranav1707@gmail.com"
                              : matchedUser.domain.includes("@")
                                ? matchedUser.domain
                                : matchedUser.name.trim().toLowerCase().replace(/\s+/g, ".") + "@" + matchedUser.domain
                          );
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
        <div className="md:col-span-7 bg-[#FCFAF6] p-6 sm:p-12 md:p-16 flex flex-col justify-between space-y-8 min-h-screen">
          <div className="space-y-8 my-auto max-w-xl w-full mx-auto">
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
              {step !== "company_verification" && (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
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
                    <label className="text-xs font-semibold text-stone-600 font-sans">Enter Email Address</label>
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
                    <strong className="text-stone-800">{customName}</strong> has been transmitted to
                    your chosen authority's live dashboard console.
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
                        localStorage.getItem(`kb_portal_pending_approvals_${cancelCompKey}`) || "[]",
                      );
                      const updated = approvals.filter(
                        (req) => req.name.toLowerCase() !== customName.trim().toLowerCase(),
                      );
                      localStorage.setItem(`kb_portal_pending_approvals_${cancelCompKey}`, JSON.stringify(updated));
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
                    To change the registered email for <strong>{customName}</strong>, an authorized office holder with a higher position must grant SSO verification inside their system dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-600 block">New Email Address</label>
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
                    An authorization request to update the email address of <strong className="text-stone-850">{customName}</strong> to <strong className="text-stone-850">{customEmail}</strong> is being processed. Sponsoring clearance is required.
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
                        localStorage.getItem(`kb_portal_pending_profile_reqs_${cancelCompKey}`) || "[]",
                      );
                      const updated = profileReqs.filter(
                        (req) => req.userName.toLowerCase() !== customName.trim().toLowerCase(),
                      );
                      localStorage.setItem(`kb_portal_pending_profile_reqs_${cancelCompKey}`, JSON.stringify(updated));
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

          <div className="text-center text-[10px] text-stone-400 border-t border-stone-100 pt-4 font-mono tracking-wider">
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

type ActiveTab = "dashboard" | "chat" | "documents" | "admin" | "profile";

function PortalPage() {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);

  const handleLoginSuccess = (user: User, company: string) => {
    setCurrentUser(user);
    setCurrentCompany(company || "EKABA");
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
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

  return (
    <div
      id="workspace_parent"
      className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#FAF6ED] to-[#F3EEE3] flex text-stone-800 font-sans w-full"
    >
      {/* Sleek Enterprise Left Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 shadow-xl hidden md:flex">
        <div className="space-y-6 py-6">
          {/* Logo Section */}
          <div className="px-6 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-100 text-sm tracking-tight leading-none">
                {formatCompanyName(currentCompany)} Portal
              </h1>
              <span className="text-[9px] font-mono font-medium text-slate-500 uppercase tracking-wider block mt-1">
                EKABA RAG Assistant
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Console</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Conversational Agent</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "documents"
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Document Center</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${activeTab === "profile" ? "text-primary-foreground" : "text-primary"}`} />
                <span>Profile Security</span>
              </div>
            </button>

            {/* Restricted Compliance panel */}
            <button
              onClick={() => {
                if (isITAdmin) {
                  setActiveTab("admin");
                }
              }}
              disabled={!isITAdmin}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                !isITAdmin
                  ? "opacity-40 cursor-not-allowed text-slate-500"
                  : activeTab === "admin"
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Admin Auditer</span>
              </div>
              {!isITAdmin && <Lock className="w-3 h-3 text-slate-600" />}
            </button>
          </nav>
        </div>

        {/* User Identity bottom widget & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-[#121110] space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50">
            <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center font-display font-bold text-xs text-amber-400 border border-stone-800">
              {currentUser.avatar || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
              <div className="text-[9px] font-mono text-amber-500 font-semibold uppercase tracking-wider truncate mt-0.5">
                {currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Single SSO</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Rail with Mobile Drawer hooks */}
        <header className="bg-white/60 backdrop-blur-md border-b border-slate-200/80 p-4 flex justify-between items-center bg-[linear-gradient(to_right,rgba(255,255,255,0.7),rgba(248,250,252,0.55))]">
          <div className="flex items-center gap-3 md:hidden">
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="font-display font-bold text-slate-800 text-sm">EKABA Assistant</h1>
          </div>

          {/* Theme Toggle & welcome status */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-[#1c1917] text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-100 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Desktop welcome status */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span>ROLE PROFILE ACTIVE:</span>
              <span className="text-primary font-mono font-bold uppercase">{currentUser.role}</span>
            </div>
          </div>

          {/* Mobile responsive Quick Tabs selector bar */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "dashboard" ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "chat" ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`p-2 rounded-lg text-xs font-bold ${activeTab === "documents" ? "bg-[#1c1917] text-white" : "text-stone-500 hover:bg-stone-100"}`}
            >
              Files
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
            />
          )}

          {activeTab === "documents" && <DocumentCenter currentUser={currentUser} />}

          {activeTab === "profile" && (
            <ProfileSettings
              currentUser={currentUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              companyName={currentCompany}
            />
          )}

          {/* RBAC Security Block guard screen */}
          {activeTab === "admin" &&
            (isITAdmin ? (
              <AdminPanel
                currentUser={currentUser}
                onUpdateCurrentUserRole={handleUpdateCurrentUserRole}
                companyName={currentCompany}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold text-slate-850">
                  Access Denied: Restricted Parameters
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your current profile credentials level is restricted. Contact network
                  administrator or shift your role selector on the system dashboard to explore IT
                  Admin telemetry controls.
                </p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 px-4 text-xs font-semibold transition"
                >
                  Return to Dashboard
                </button>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
