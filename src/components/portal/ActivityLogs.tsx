import { useState, useEffect } from "react";
import { Clock, RefreshCw, AlertCircle, Calendar, ShieldCheck } from "lucide-react";
import { User } from "../../types";

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  created_at: string;
}

interface ActivityLogsProps {
  currentUser: User;
  companyName: string;
}

export default function ActivityLogs({ currentUser, companyName }: ActivityLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/activities?userId=${encodeURIComponent(currentUser.id)}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        throw new Error("Unable to retrieve activity logs from system.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Network error loading logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentUser]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-slate-800 text-lg">
            Personal Activity Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit log of your compliance actions inside {companyName.toUpperCase()}
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg p-2 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Info notice explaining 2-day limit */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-850 uppercase tracking-wide">
            Automated 48-Hour Purge System Active
          </h4>
          <p className="text-xs text-indigo-750 leading-relaxed">
            To maintain SOC-2 privacy standards and clean audit cycles, activity history is retained for 
            <strong> exactly 2 days (48 hours)</strong>. Logs older than 2 days are permanently and automatically deleted from the database.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-mono">RETRIEVING AUDIT TRAIL...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 text-rose-500 border border-rose-100 rounded-xl bg-rose-50/30 gap-2">
          <AlertCircle className="w-8 h-8" />
          <span className="text-xs font-semibold">{error}</span>
          <button
            onClick={fetchLogs}
            className="text-xs text-indigo-600 hover:underline mt-2 font-bold"
          >
            Try Again
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-350 mb-2" />
          <p className="text-sm font-semibold text-slate-650">No recent activities found.</p>
          <p className="text-xs text-slate-450 mt-1">
            Perform actions like uploading documents, updating security keys, or querying the chat to populate this ledger.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-4 font-bold">Timestamp</th>
                  <th className="p-3.5 font-bold">Action / Operation</th>
                  <th className="p-3.5 pr-4 font-bold text-right">System Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {logs.map((log) => {
                  const dateStr = new Date(log.created_at).toLocaleString();
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4 font-mono text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium leading-normal">
                        {log.action}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Logged
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
