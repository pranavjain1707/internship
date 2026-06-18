/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Server,
  Database,
  Key,
  CheckCircle,
  RefreshCcw,
  UserPlus,
  Trash,
  Shield,
  RefreshCw,
  XCircle,
  Trash2,
} from "lucide-react";
import { User, UserRole, ROLE_HIERARCHY, PendingKickRequest } from "../../types";

interface AdminPanelProps {
  currentUser: User;
  onUpdateCurrentUserRole: (newRole: UserRole) => void;
  companyName: string;
}

export default function AdminPanel({ currentUser, onUpdateCurrentUserRole, companyName }: AdminPanelProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // System status metrics
  const [systemUptime, setSystemUptime] = useState("99.98%");
  const [vectorIndexSize, setVectorIndexSize] = useState("48 vectors");
  const [modelType, setModelType] = useState("gemini-3.5-flash");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?company=${encodeURIComponent(companyName)}`);
      if (res.ok) {
        const data = await res.json();
        setUserList(data);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [companyName]);

  const handleRoleChange = async (targetUser: User, newRole: UserRole) => {
    setNotice(null);
    const myRank = ROLE_HIERARCHY[currentUser.role] || 0;
    const targetCurrentRank = ROLE_HIERARCHY[targetUser.role] || 0;
    const proposedRank = ROLE_HIERARCHY[newRole] || 0;

    // Checks:
    // 1. Cannot alter Owner
    if (targetUser.role === "Owner") {
      setNotice({
        type: "error",
        text: "Security Violation: Global Owner role rank cannot be edited on this terminal.",
      });
      return;
    }

    // 2. Cannot alter someone of equal or higher rank unless Owner
    if (currentUser.role !== "Owner" && myRank <= targetCurrentRank) {
      setNotice({
        type: "error",
        text: `Access Denied: Your rank (${currentUser.role}) is insufficient to change the role of ${targetUser.name} (${targetUser.role}).`,
      });
      return;
    }

    // 3. Cannot promote someone higher than your own rank
    if (currentUser.role !== "Owner" && proposedRank > myRank) {
      setNotice({
        type: "error",
        text: `Access Denied: You cannot promote anyone to a rank higher than your own (${currentUser.role}).`,
      });
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const res = await fetch("/api/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser.id, role: newRole, company: companyName }),
      });
      if (res.ok) {
        // Also synchronize local storage db for sso register
        const dbStr = localStorage.getItem(`kb_portal_users_db_${companyName.toLowerCase().trim()}`);
        if (dbStr) {
          const db = JSON.parse(dbStr);
          const userKey = targetUser.name.toLowerCase();
          if (db[userKey]) {
            db[userKey].role = newRole;
            localStorage.setItem(`kb_portal_users_db_${companyName.toLowerCase().trim()}`, JSON.stringify(db));
          }
        }

        setNotice({
          type: "success",
          text: `Successfully updated ${targetUser.name}'s system authority level to ${newRole}.`,
        });
        await fetchUsers();

        // If modified own role, update state
        if (targetUser.id === currentUser.id) {
          onUpdateCurrentUserRole(newRole);
        }
      } else {
        setNotice({ type: "error", text: "Server rejected role update synchronization." });
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: "error", text: "Failed to synchronize role change." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleKickUser = async (targetUser: User) => {
    setNotice(null);
    const myRank = ROLE_HIERARCHY[currentUser.role] || 0;
    const targetRank = ROLE_HIERARCHY[targetUser.role] || 0;

    if (targetUser.role === "Owner") {
      setNotice({
        type: "error",
        text: "Security Exception: Absolute System Owner cannot be kicked under any circumstances.",
      });
      return;
    }

    if (currentUser.role !== "Owner" && myRank <= targetRank) {
      setNotice({
        type: "error",
        text: `Access Denied: You do not have authority to kick ${targetUser.name} (${targetUser.role}) who is of equal or higher rank.`,
      });
      return;
    }

    // Owner can kick directly!
    if (currentUser.role === "Owner") {
      setConfirmModal({
        isOpen: true,
        title: "Confirm User Termination",
        message: `Are you absolutely sure you want to terminate user record for ${targetUser.name}? This action is irreversible.`,
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setUpdatingId(targetUser.id);
          try {
            const res = await fetch("/api/users/kick", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: targetUser.id, company: companyName }),
            });
            if (res.ok) {
              // Clean credentials from local storage db
              const companyKey = companyName.toLowerCase().trim();
              const dbStr = localStorage.getItem(`kb_portal_users_db_${companyKey}`);
              if (dbStr) {
                const db = JSON.parse(dbStr);
                const userKey = targetUser.name.toLowerCase();
                if (db[userKey]) {
                  delete db[userKey];
                  localStorage.setItem(`kb_portal_users_db_${companyKey}`, JSON.stringify(db));
                }
              }

              // Record as kicked to prevent auto-recreation
              const kickedStr = localStorage.getItem(`kb_portal_kicked_users_${companyKey}`) || "[]";
              try {
                const kicked: string[] = JSON.parse(kickedStr);
                const targetKey = targetUser.name.toLowerCase();
                if (!kicked.includes(targetKey)) {
                  kicked.push(targetKey);
                  localStorage.setItem(`kb_portal_kicked_users_${companyKey}`, JSON.stringify(kicked));
                }
              } catch (e) {}

              setNotice({
                type: "success",
                text: `Successfully terminated and destroyed user record for ${targetUser.name}.`,
              });
              await fetchUsers();
            } else {
              const errData = await res.json().catch(() => ({}));
              setNotice({
                type: "error",
                text: errData.error || "Failed to kick user from backend storage.",
              });
            }
          } catch (err) {
            console.error(err);
            setNotice({ type: "error", text: "Network connection failure routing kick request." });
          } finally {
            setUpdatingId(null);
          }
        }
      });
    } else {
      // Manager & HR must request Owner sign-off permission!
      // Get the owner name dynamically for the company
      const ownerName = companyName.toLowerCase().trim() === "google"
        ? "Sundar Pichai"
        : companyName.toLowerCase().trim() === "acme corp" || companyName.toLowerCase().trim() === "acme"
          ? "Wile E. Coyote"
          : companyName.toLowerCase().trim() === "microsoft"
            ? "Satya Nadella"
            : companyName.toLowerCase().trim() === "apple"
              ? "Tim Cook"
              : "Pranav Jain";

      setConfirmModal({
        isOpen: true,
        title: "Request Kick Sign-off",
        message: `Your position (${currentUser.role}) requires absolute Owner sign-off to kick ${targetUser.name}. Dispatch clearance request to Owner dashboard?`,
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          setUpdatingId(targetUser.id);
          try {
            const reqsStr = localStorage.getItem(`kb_portal_pending_kick_reqs_${companyName.toLowerCase().trim()}`) || "[]";
            const reqs: PendingKickRequest[] = JSON.parse(reqsStr);

            // Deduplicate
            const updated = reqs.filter(
              (r) => r.targetUserId !== targetUser.id || r.status !== "pending",
            );

            const newReq: PendingKickRequest = {
              id: `kick-req-${Date.now()}`,
              targetUserId: targetUser.id,
              targetUserName: targetUser.name,
              targetUserRole: targetUser.role,
              requestedBy: currentUser.name,
              requestedByRole: currentUser.role,
              status: "pending",
              createdAt: new Date().toISOString(),
            };

            updated.push(newReq);
            localStorage.setItem(`kb_portal_pending_kick_reqs_${companyName.toLowerCase().trim()}`, JSON.stringify(updated));
            setNotice({
              type: "success",
              text: `Clearance request for terminating ${targetUser.name} successfully dispatched to Owner (${ownerName}) dashboard!`,
            });
          } catch (err) {
            console.error(err);
            setNotice({ type: "error", text: "Failed to record pending kick authorization request." });
          } finally {
            setUpdatingId(null);
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Indicators */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="p-3 bg-stone-100 text-stone-700 rounded-xl">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block font-bold">
              SYSTEM TELEMETRY
            </span>
            <div className="text-sm font-semibold text-stone-800 font-sans">
              Uptime: {systemUptime}
            </div>
            <span className="text-[9px] text-amber-600 font-mono flex items-center gap-1 mt-0.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              99.9% TARGET MET (FIPS)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="p-3 bg-stone-100 text-stone-700 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block font-bold">
              EMBEDDINGS CORES
            </span>
            <div className="text-sm font-semibold text-stone-800 font-sans">{vectorIndexSize}</div>
            <span className="text-[9px] text-stone-500 font-mono mt-0.5 block">
              ORGANIZATIONAL DATA SEGMENTS
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block font-bold">
              AI RAG COGNITIVE MODEL
            </span>
            <div className="text-sm font-semibold text-stone-800 font-sans">{modelType}</div>
            <span className="text-[9px] text-amber-700 font-mono font-bold mt-0.5 block uppercase">
              LAZY-LOAD SECURE INITIALIZATION
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* User Management */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display font-bold text-slate-800 text-base">
                Failsafe User Role Management
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                CHANGE IDENTITY ROLE OR SUBMIT KICK REQUEST PROTOCOLS SECURELY
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-lg transition"
              title="Refresh Users"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {notice && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                notice.type === "success"
                  ? "bg-emerald-50 border-emerald-205 text-emerald-800"
                  : "bg-rose-50 border-rose-205 text-rose-800"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs font-mono">
              LOADING IDENTITIES...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                    <th className="py-2 pb-3">Enterprise Employee</th>
                    <th className="py-2 pb-3">SSO Email Target</th>
                    <th className="py-2 pb-3">Security Level Role</th>
                    <th className="py-2 pb-3 text-right">Access Shift Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {userList.map((user) => {
                    const myRank = ROLE_HIERARCHY[currentUser.role] || 0;
                    const targetRank = ROLE_HIERARCHY[user.role] || 0;
                    const isTargetHigherOrSelf =
                      currentUser.role !== "Owner" &&
                      (myRank <= targetRank || user.id === currentUser.id);
                    const isOwnerRow = user.role === "Owner";

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/40">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                              {user.avatar || "U"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.id === currentUser.id && (
                                  <span className="bg-amber-100 text-amber-800 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {user.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-2 font-mono text-[11px] text-slate-500">
                          {user.email}
                        </td>
                        <td className="py-3 pr-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold border ${
                              user.role === "Owner"
                                ? "bg-amber-50 border-amber-200 text-amber-850 shadow-sm"
                                : user.role === "IT Administrator"
                                  ? "bg-rose-50 border-rose-100 text-rose-700"
                                  : user.role === "HR Officer"
                                    ? "bg-purple-50 border-purple-100 text-purple-700"
                                    : user.role === "Manager"
                                      ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                                      : "bg-stone-50 border-stone-200 text-stone-600"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwnerRow ? (
                              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-205">
                                OWNER SYSTEM KEY
                              </span>
                            ) : (
                              <>
                                <select
                                  disabled={updatingId !== null || isTargetHigherOrSelf}
                                  value={user.role}
                                  onChange={(e) =>
                                    handleRoleChange(user, e.target.value as UserRole)
                                  }
                                  className="bg-white border border-slate-250 focus:border-amber-600 rounded-lg text-xs py-1 px-2.5 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 shadow-sm"
                                >
                                  {Object.keys(ROLE_HIERARCHY).map((roleName) => {
                                    const roleRank = ROLE_HIERARCHY[roleName as UserRole];
                                    if (currentUser.role !== "Owner" && roleRank > myRank)
                                      return null;
                                    return (
                                      <option key={roleName} value={roleName}>
                                        {roleName}
                                      </option>
                                    );
                                  })}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleKickUser(user)}
                                  disabled={updatingId !== null || isTargetHigherOrSelf}
                                  title={
                                    currentUser.role === "Owner"
                                      ? "Terminate User Record"
                                      : "Request Owner to Kick"
                                  }
                                  className="p-1 px-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition flex items-center gap-1 text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{currentUser.role === "Owner" ? "Kick" : "Req Kick"}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit policies */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-display font-bold text-slate-800 text-base">
              Access Rules & Policy Audits
            </h2>
            <p className="text-xs text-slate-400">
              Enterprise security parameters (Section 14 & 15)
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex gap-2.5 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  GDPR & SSL Standard Encryption
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  TLS 1.3 tunnels and AES-255 core backend database configurations enforced.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Failsafe System Autopolling
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Continuous integrity monitor checking index duplication, silos and context
                  matching.
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-stone-850 font-display">
                {confirmModal.title}
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="bg-[#faf6ed] hover:bg-[#eae2d5] border border-stone-200 rounded-xl py-2 px-4 font-semibold text-xs text-stone-550 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2 px-4 font-semibold text-xs transition-colors cursor-pointer shadow-md"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
