"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  Activity,
  Check,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Clock,
  Sparkles
} from "lucide-react";

export default function NotificationsPage() {
  const { notifications, activityLogs, markNotificationsRead } = useApp();

  // Mark all notifications as read on page load/visit
  useEffect(() => {
    markNotificationsRead();
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("approve") || act.includes("resolve") || act.includes("confirm")) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    }
    if (act.includes("request") || act.includes("raise")) {
      return "bg-amber-50 text-amber-600 border border-amber-100";
    }
    return "bg-slate-50 text-slate-500 border border-slate-200";
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Notifications & System Logs</h1>
        <p className="text-xs text-slate-500 mt-1">Review user notifications and a tamper-proof system audit log of operations.</p>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Notifications Feed (1/3 width) */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-250 pb-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">User Notifications</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">No notifications.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-3 flex gap-3 items-start text-left first:pt-0 last:pb-0">
                  <div className="shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-xs leading-4">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: System Audit Logs (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-250 pb-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Full System Audit Log</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center italic">No audit records saved.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Triggered By</th>
                      <th className="p-3.5">Action Event</th>
                      <th className="p-3.5">Activity Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 text-slate-450 font-mono text-[10px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5 font-bold text-slate-750">{log.actorName}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium leading-relaxed">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-3 bg-blue-50/30 text-[10px] text-slate-500 rounded-xl leading-4 flex gap-1.5 items-start mt-6 text-left">
              <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Audit trails record administrative events, allocation handovers, bookings, repairs, and audit closes.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
