"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ShieldCheck,
  BarChart3,
  Bell,
  LogOut,
  Workflow
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, notifications, transferRequests, maintenanceRequests } = useApp();

  // Calculate pending counts for badges
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const pendingTransfers = transferRequests.filter((t) => t.status === "Pending").length;
  const pendingMaintenance = maintenanceRequests.filter((m) => m.status === "Pending").length;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
    },
    {
      name: "Organization Setup",
      href: "/organization",
      icon: Building2,
      roles: ["Admin"], // Admin only!
    },
    {
      name: "Assets Directory",
      href: "/assets",
      icon: FolderTree,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
    },
    {
      name: "Allocation & Transfer",
      href: "/allocations",
      icon: ArrowLeftRight,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
      badge: pendingTransfers > 0 && currentUser.role !== "Employee" ? pendingTransfers : undefined,
    },
    {
      name: "Resource Booking",
      href: "/bookings",
      icon: CalendarDays,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
      badge: pendingMaintenance > 0 && currentUser.role === "Asset Manager" ? pendingMaintenance : undefined,
    },
    {
      name: "Audit",
      href: "/audits",
      icon: ShieldCheck,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["Admin", "Asset Manager", "Department Head"], // No Employee
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
    },
  ];

  return (
    <aside className="w-72 bg-slate-950/95 backdrop-blur-2xl text-slate-300 flex flex-col h-screen sticky top-0 border-r border-white/5 z-20 shadow-2xl overflow-hidden relative">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-7 border-b border-white/5 gap-3 shrink-0 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black tracking-wider shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
          AF
        </div>
        <span className="text-2xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AssetFlow</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
        {menuItems.map((item) => {
          if (!item.roles.includes(currentUser.role)) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group duration-300 relative overflow-hidden ${
                isActive
                  ? "text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
              )}
              
              <div className="flex items-center gap-3.5 relative z-10">
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400 group-hover:scale-110"
                  }`}
                />
                <span className={`transition-transform duration-300 ${isActive ? "" : "group-hover:translate-x-1"}`}>
                  {item.name}
                </span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 shadow-sm ${
                    isActive ? "bg-white text-blue-600" : "bg-blue-500 text-white group-hover:bg-blue-400 group-hover:scale-110 transition-transform"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Quick Info & Logout */}
      <div className="p-5 border-t border-white/5 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 shrink-0 shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-blue-400 transition-colors">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider leading-relaxed mt-0.5">{currentUser.role}</p>
            </div>
          </div>
          <Link
            href="/"
            title="Log Out / Exit Demo"
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors shrink-0 group"
          >
            <LogOut className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
