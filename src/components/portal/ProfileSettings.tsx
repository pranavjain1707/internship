import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Mail,
  Check,
  X,
  Loader2,
  UserCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { User, UserRole, ROLE_HIERARCHY, PendingProfileRequest } from "../../types";

interface ProfileSettingsProps {
  currentUser: User;
  onUpdateCurrentUser: (email: string, name?: string) => void;
  companyName: string;
}

export default function ProfileSettings({
  currentUser,
  onUpdateCurrentUser,
  companyName,
}: ProfileSettingsProps) {
  const [currentName, setCurrentName] = useState(currentUser.name);
  const [currentEmail, setCurrentEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState("");

  // Edit inputs
  const [newName, setNewName] = useState(currentUser.name);
  const [newEmail, setNewEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState("");

  const [eligibleSponsors, setEligibleSponsors] = useState<User[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");
  const [pendingRequest, setPendingRequest] = useState<PendingProfileRequest | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load password from local storage database
  useEffect(() => {
    try {
      setCurrentName(currentUser.name);
      setNewName(currentUser.name);
      setCurrentEmail(currentUser.email);
      setNewEmail(currentUser.email);

      const dbStr = localStorage.getItem(`kb_portal_users_db_${companyName.toLowerCase().trim()}`);
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const userRec = db[currentUser.name.toLowerCase()];
        if (userRec) {
          setCurrentPassword(userRec.password);
        }
      }
    } catch (e) {
      console.error("Failed to load user password:", e);
    }
  }, [currentUser, companyName]);

  // Load list of potential higher authority sponsors
  const loadSponsors = async () => {
    try {
      const res = await fetch(`/api/users?company=${encodeURIComponent(companyName)}`);
      if (res.ok) {
        const users: User[] = await res.json();
        const myRank = ROLE_HIERARCHY[currentUser.role] || 0;

        // Sponsors must be of higher rank than current user
        const potential = users.filter((user) => {
          const rank = ROLE_HIERARCHY[user.role] || 0;
          return rank > myRank;
        });
        setEligibleSponsors(potential);
        if (potential.length > 0) {
          setSelectedSponsorId(potential[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load sponsors:", err);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, [currentUser, companyName]);

  // Check and poll for pending request approval
  useEffect(() => {
    if (currentUser.role === "Owner") return;

    const checkRequest = () => {
      try {
        const reqsStr = localStorage.getItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`);
        if (reqsStr) {
          const reqs: PendingProfileRequest[] = JSON.parse(reqsStr);
          const myReq = reqs.find((r) => r.userId === currentUser.id && r.status === "pending");
          if (myReq) {
            setPendingRequest(myReq);
            return;
          }

          // If a request was approved or rejected:
          const processedReq = reqs.find((r) => r.userId === currentUser.id);
          if (processedReq) {
            if (processedReq.status === "approved") {
              setSuccess(
                `Status Checked: Your profile update has been authorized by ${processedReq.approvedBy}! Successfully applied.`,
              );
              onUpdateCurrentUser(processedReq.requestedEmail, processedReq.requestedName);

              // Clean up password input fields & update current display password
              if (processedReq.requestedPassword) {
                setCurrentPassword(processedReq.requestedPassword);
              }
              if (processedReq.requestedName) {
                setCurrentName(processedReq.requestedName);
                setNewName(processedReq.requestedName);
              }
              setCurrentEmail(processedReq.requestedEmail);
              setNewPassword("");

              const updated = reqs.filter((r) => r.userId !== currentUser.id);
              localStorage.setItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`, JSON.stringify(updated));
              setPendingRequest(null);
            } else if (processedReq.status === "rejected") {
              setError(`Your security update request was declined by ${processedReq.approvedBy}.`);
              const updated = reqs.filter((r) => r.userId !== currentUser.id);
              localStorage.setItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`, JSON.stringify(updated));
              setPendingRequest(null);
            }
          } else {
            setPendingRequest(null);
          }
        } else {
          setPendingRequest(null);
        }
      } catch (err) {
        console.error("Error polling profile requests:", err);
      }
    };

    checkRequest();
    const interval = setInterval(checkRequest, 1500);
    return () => clearInterval(interval);
  }, [currentUser, onUpdateCurrentUser, companyName]);

  const handleOwnerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== "Owner") return;
    setError("");
    setSuccess("");

    if (!newName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        // Update Local Storage
        const dbStr = localStorage.getItem(`kb_portal_users_db_${companyName.toLowerCase().trim()}`);
        if (dbStr) {
          const db = JSON.parse(dbStr);
          const oldKey = currentUser.name.toLowerCase();
          const newKey = newName.toLowerCase().trim();
          const oldRecord = db[oldKey];
          const updatedRecord = {
            ...oldRecord,
            name: newName.trim(),
            domain: newEmail.split("@")[1] || oldRecord.domain,
            password: newPassword || oldRecord.password,
          };
          if (oldKey !== newKey) {
            delete db[oldKey];
          }
          db[newKey] = updatedRecord;
          localStorage.setItem(`kb_portal_users_db_${companyName.toLowerCase().trim()}`, JSON.stringify(db));
        }

        // Update Backend
        const res = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentUser.id,
            name: newName.trim(),
            email: newEmail,
            role: currentUser.role,
            avatar:
              newName
                .trim()
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .join("")
                .substring(0, 2)
                .toUpperCase() || currentUser.avatar,
            password: newPassword || currentPassword,
            domain: newEmail.split("@")[1] || "enterprise.com",
            company: companyName,
          }),
        });

        if (res.ok) {
          onUpdateCurrentUser(newEmail, newName.trim());
          setSuccess("System Owner credentials successfully synchronized immediately.");
          if (newPassword) {
            setCurrentPassword(newPassword);
            setNewPassword("");
          }
          setCurrentEmail(newEmail);
          setCurrentName(newName.trim());
        } else {
          throw new Error("Server update failed");
        }
      } catch (err) {
        setError("Synchronisation offset failed. Please retry.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleRequestClearance = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      setError("Please provide a valid email format.");
      return;
    }

    if (!selectedSponsorId) {
      setError("Please choose a higher authority sponsor first.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const reqs: PendingProfileRequest[] = JSON.parse(
          localStorage.getItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`) || "[]",
        );

        // Get sponsor's actual name
        const sponsorName =
          eligibleSponsors.find((s) => s.id === selectedSponsorId)?.name || "Owner";

        const newReq: PendingProfileRequest = {
          id: `profile-req-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          requestedName: newName.trim() === currentUser.name ? undefined : newName.trim(),
          requestedEmail: newEmail.trim(),
          requestedPassword: newPassword ? newPassword : undefined,
          requestedByRole: currentUser.role,
          sponsorName,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // Clean up duplicates
        const updated = reqs.filter((r) => r.userId !== currentUser.id);
        updated.push(newReq);
        localStorage.setItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`, JSON.stringify(updated));

        setPendingRequest(newReq);
        setSuccess("Security clearance dispatch success! Waiting on sponsoring signature.");
      } catch (err) {
        setError("Request failed to route.");
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  const cancelRequest = () => {
    try {
      const reqs: PendingProfileRequest[] = JSON.parse(
        localStorage.getItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`) || "[]",
      );
      const updated = reqs.filter((r) => r.userId !== currentUser.id);
      localStorage.setItem(`kb_portal_pending_profile_reqs_${companyName.toLowerCase().trim()}`, JSON.stringify(updated));
      setPendingRequest(null);
      setError("");
      setSuccess("Request successfully pulled back.");
    } catch (e) {
      console.error(e);
    }
  };

  const isOwner = currentUser.role === "Owner";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-display font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-amber-700" />
          <span>Profile Security Settings</span>
        </h1>
        <p className="text-xs text-stone-505 mt-1 font-mono">
          MANAGE YOUR ORGANIZATIONAL PROFILE PARAMETERS & SSO ROUTING SECURELY
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Form panel */}
        <div className="md:col-span-8 bg-white/80 rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-6">
          {/* Active profile card */}
          <div className="bg-[#FAF6ED] border border-amber-200/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center font-bold text-sm font-display border border-stone-820">
                {currentUser.avatar || "EE"}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-stone-850">{currentUser.name}</h3>
                <p className="text-[10px] font-mono font-bold text-amber-805 uppercase bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                  {currentUser.role}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right font-mono text-[10px] text-stone-500">
              <div>SSO IDENTIFIER: {currentUser.id}</div>
              <div>SYSTEM LEVEL: {ROLE_HIERARCHY[currentUser.role] || 1} / 5</div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {pendingRequest && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-805 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-707 animate-spin" />
                  Clearance Dispatch Polling...
                </span>
                <button
                  type="button"
                  onClick={cancelRequest}
                  className="text-[10px] text-rose-650/90 font-bold hover:underline cursor-pointer"
                >
                  Cancel Request
                </button>
              </div>
              <div className="text-xs text-stone-600 leading-relaxed font-mono p-3 bg-white border border-stone-200 rounded-lg space-y-1">
                {pendingRequest.requestedName && (
                  <div>
                    PROPOSED NAME:{" "}
                    <span className="text-stone-800">{pendingRequest.requestedName}</span>
                  </div>
                )}
                <div>
                  PROPOSED EMAIL:{" "}
                  <span className="text-stone-800">{pendingRequest.requestedEmail}</span>
                </div>
                {pendingRequest.requestedPassword && (
                  <div>
                    PROPOSED PASS: <span className="text-stone-800 tracking-widest">••••••••</span>
                  </div>
                )}
                <div>
                  ROUTED TO SPONSOR:{" "}
                  <span className="text-stone-800 font-bold">{pendingRequest.sponsorName}</span>
                </div>
                <div className="text-[10px] text-amber-800 font-bold mt-1 uppercase">
                  Awaiting sign-off inside higher dashboard portal
                </div>
              </div>
            </div>
          )}

          {/* Actual inputs */}
          <form onSubmit={isOwner ? handleOwnerSave : handleRequestClearance} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 block">Full Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError("");
                  }}
                  disabled={!!pendingRequest}
                  className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-800 focus:outline-none placeholder:text-stone-300 shadow-inner"
                  placeholder="Enter your full name"
                />
              </div>
              <span className="text-[10px] text-stone-400 block font-mono">
                Current name: {currentName}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 block">
                Single-Sign-On Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setError("");
                  }}
                  disabled={!!pendingRequest}
                  className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-800 focus:outline-none placeholder:text-stone-300 shadow-inner"
                />
              </div>
              <span className="text-[10px] text-stone-400 block font-mono">
                Current email: {currentEmail}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 block">
                Enter New Password (Leave blank to keep existing)
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  placeholder="Establish a secure password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  disabled={!!pendingRequest}
                  className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-2.5 pl-10 pr-4 text-xs text-stone-800 focus:outline-none placeholder:text-stone-300 shadow-inner font-mono"
                />
              </div>
              <span className="text-[10px] text-stone-400 block font-mono">
                Current password: <span className="tracking-widest">••••••••</span>
              </span>
            </div>

            {/* If NOT owner, choose supervisor Sponsor */}
            {!isOwner && (
              <div className="pt-2 border-t border-stone-100 space-y-4">
                <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-700 font-bold text-xs">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Sponsoring Sign-off Required</span>
                  </div>
                  <p className="text-[11px] text-stone-505 leading-normal">
                    FIPS clearance dictates that profile security alterations for{" "}
                    <strong>{currentUser.role}s</strong> must be authenticated digitally by a higher
                    office-holder in real-time.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 block">
                    Select Sponsoring Supervisor / Owner
                  </label>
                  {eligibleSponsors.length === 0 ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-650">
                      System Notice: No registered supervisor accounts found with higher rank.
                      Override via Owner {companyName.toLowerCase().trim() === "google" ? "Sundar Pichai" : companyName.toLowerCase().trim() === "acme corp" || companyName.toLowerCase().trim() === "acme" ? "Wile E. Coyote" : companyName.toLowerCase().trim() === "microsoft" ? "Satya Nadella" : companyName.toLowerCase().trim() === "apple" ? "Tim Cook" : "Pranav Jain"} is required to proceed.
                    </div>
                  ) : (
                    <select
                      value={selectedSponsorId}
                      onChange={(e) => setSelectedSponsorId(e.target.value)}
                      disabled={!!pendingRequest}
                      className="w-full bg-white border border-stone-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded-xl py-2.5 px-3.5 text-xs text-stone-800 focus:outline-none cursor-pointer"
                    >
                      {eligibleSponsors.map((sponsor) => (
                        <option key={sponsor.id} value={sponsor.id}>
                          {sponsor.name} ({sponsor.role})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!pendingRequest || (!isOwner && eligibleSponsors.length === 0)}
              className="w-full bg-[#1c1917] hover:bg-[#2b2721] text-white rounded-xl py-3 text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  {isOwner
                    ? "Synchronising System Owner Credentials..."
                    : "Routing Clearance Request..."}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>
                    {isOwner ? "Update Credentials Instantly" : "Dispatch Clearance Request"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="md:col-span-4 bg-[#FAF6ED]/50 border border-amber-200/50 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-800 font-sans uppercase tracking-wider">
              Access Clearance Protocols
            </h4>
            <p className="text-[10px] text-stone-500 font-mono">FIPS 140-2 CODE EXPLANATION</p>
          </div>

          <div className="space-y-3.5 text-[11px] text-stone-650 leading-relaxed">
            <div className="space-y-1">
              <strong>1. Absolute Owner Override</strong>
              <p className="text-stone-505">
                The Global System Owner ({companyName.toLowerCase().trim() === "google" ? "Sundar Pichai" : companyName.toLowerCase().trim() === "acme corp" || companyName.toLowerCase().trim() === "acme" ? "Wile E. Coyote" : companyName.toLowerCase().trim() === "microsoft" ? "Satya Nadella" : companyName.toLowerCase().trim() === "apple" ? "Tim Cook" : "Pranav Jain"}) possesses keys to overwrite their security
                profile immediately without routing signatures.
              </p>
            </div>

            <div className="space-y-1 border-t border-stone-200/50 pt-2.5">
              <strong>2. Supervisor Sponsoring Sign-off</strong>
              <p className="text-stone-505">
                Clearance rules segment parameters. To edit details, an active employee must submit
                a digital routing block approved by superior roles.
              </p>
            </div>

            <div className="space-y-1 border-t border-stone-200/50 pt-2.5">
              <strong>3. High-Security Hashing</strong>
              <p className="text-stone-505">
                All updated hashes are stored securely. Any failure triggers automated diagnostics
                alerts visible in our security logs dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
