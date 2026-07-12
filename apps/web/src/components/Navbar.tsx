"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useApp, Employee } from "@/context/AppContext";
import { Bell, RefreshCw, ChevronDown, Check, ShieldAlert, Users, Info } from "lucide-react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, employees, notifications, resetAllData } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Generate breadcrumb / title
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/organization":
        return "Organization Setup";
      case "/assets":
        return "Asset Registry";
      case "/allocations":
        return "Asset Allocations & Transfers";
      case "/bookings":
        return "Resource Bookings";
      case "/maintenance":
        return "Maintenance Management";
      case "/audits":
        return "Asset Audit Cycles";
      case "/reports":
        return "Reports & Analytics";
      case "/notifications":
        return "Notifications & Logs";
      default:
        return "AssetFlow Portal";
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleUserSwitch = (user: Employee) => {
    setCurrentUser(user);
    setShowUserDropdown(false);
    // Reload the page to refresh states across the app cleanly
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 flex items-center justify-between px-8 z-20 shadow-sm shrink-0">
      {/* Page Title / Context */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Reset System Trigger */}
        <button
          onClick={() => {
            if (confirm("Reset all local database simulations back to defaults?")) {
              resetAllData();
              window.location.reload();
            }
          }}
          title="Reset Simulation Data"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-2 fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700">Notifications ({unreadNotifs.length} unread)</span>
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-left ${n.read ? "bg-white" : "bg-blue-50/20"}`}>
                      <p className="font-semibold text-xs text-slate-800 flex items-center gap-1">
                        {n.type === "warning" && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Role Simulator Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="leading-3 text-[10px] text-slate-400 font-medium">Simulator Active Role</p>
              <p className="leading-4 font-bold text-slate-700 mt-0.5">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-2 fade-in">
              <div className="px-4 py-1.5 border-b border-slate-100 flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Switch Employee / Role</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleUserSwitch(emp)}
                    className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-left text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {emp.role} • {emp.departmentId === "dept-1" ? "IT" : emp.departmentId === "dept-2" ? "Operations" : emp.departmentId === "dept-3" ? "Marketing" : "HR"}
                      </p>
                    </div>
                    {currentUser.id === emp.id && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 px-4 py-2 bg-blue-50/30 text-[10px] text-slate-500 leading-4 flex gap-1.5 items-start">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>Switching users mimics authentic logins. It allows testing specific role restrictions like approvals, audits, and setups.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
