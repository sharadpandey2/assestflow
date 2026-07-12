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
    <header className="h-20 glass border-b border-white/20 sticky top-0 flex items-center justify-between px-8 z-20 shrink-0 transition-all">
      {/* Page Title / Context */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">{getPageTitle()}</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Reset System Trigger */}
        <button
          onClick={() => {
            if (confirm("Reset all local database simulations back to defaults?")) {
               resetAllData();
               window.location.reload();
            }
          }}
          title="Reset Simulation Data"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all group shadow-sm border border-transparent hover:border-blue-100"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset Demo</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all relative group shadow-sm border border-transparent hover:border-blue-100"
            title="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:animate-bounce" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-sm text-slate-800 tracking-tight">Notifications <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-xs ml-1">{unreadNotifs.length}</span></span>
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 text-left transition-colors hover:bg-slate-50 ${n.read ? "bg-white" : "bg-blue-50/30"}`}>
                      <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        {n.type === "warning" && <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />}
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User Role Simulator Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-105 transition-transform">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block py-1">
              <p className="leading-3 text-[10px] text-slate-400 font-bold tracking-wider uppercase">Active Role</p>
              <p className="leading-4 font-bold text-slate-800 mt-0.5">{currentUser.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showUserDropdown ? 'rotate-180 text-blue-500' : 'group-hover:text-slate-600'}`} />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-500 bg-slate-50/50">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Switch Employee Profile</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto p-2 custom-scrollbar">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleUserSwitch(emp)}
                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-left text-xs transition-all mb-1 ${currentUser.id === emp.id ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div>
                      <p className={`font-bold ${currentUser.id === emp.id ? 'text-blue-700' : 'text-slate-700'}`}>{emp.name}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${currentUser.id === emp.id ? 'text-blue-500' : 'text-slate-500'}`}>
                        {emp.role} • {emp.departmentId === "dept-1" ? "IT" : emp.departmentId === "dept-2" ? "Operations" : emp.departmentId === "dept-3" ? "Marketing" : "HR"}
                      </p>
                    </div>
                    {currentUser.id === emp.id && <Check className="w-5 h-5 text-blue-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100 px-5 py-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-[10px] text-slate-600 leading-relaxed flex gap-2 items-start rounded-b-2xl">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="font-medium">Switching profiles mimics authentic logins to test role-based access control, approvals, and audits.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
