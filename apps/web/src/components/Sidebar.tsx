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
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-10">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold tracking-wider">
          AF
        </div>
        <span className="text-xl font-bold text-white tracking-tight">AssetFlow</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          // Role restriction check
          if (!item.roles.includes(currentUser.role)) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30"
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-4">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide leading-3 mt-0.5">{currentUser.role}</p>
            </div>
          </div>
          <Link
            href="/"
            title="Log Out / Exit Demo"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
