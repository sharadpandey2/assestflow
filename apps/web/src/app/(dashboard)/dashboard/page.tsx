"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  CheckCircle,
  FolderMinus,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Plus,
  BookOpen,
  AlertCircle,
  Clock,
  Wrench,
  Activity,
  Zap,
  TrendingUp,
  X
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const {
    assets,
    allocations,
    bookings,
    transferRequests,
    maintenanceRequests,
    activityLogs,
    categories,
    employees,
    registerAsset,
    createBooking,
    raiseMaintenance,
  } = useApp();

  // Calculated KPI stats
  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const allocatedCount = assets.filter((a) => a.status === "Allocated").length;
  const maintenanceCount = assets.filter((a) => a.status === "Under Maintenance").length;
  const activeBookingsCount = bookings.filter((b) => b.status === "Upcoming" || b.status === "Ongoing").length;
  const pendingTransfersCount = transferRequests.filter((t) => t.status === "Pending").length;

  // Overdue allocations (due back date before 2026-07-12)
  const todayDate = "2026-07-12";
  const overdueAllocations = allocations.filter(
    (a) => a.status === "Active" && a.expectedReturnDate && a.expectedReturnDate < todayDate
  );
  const overdueCount = overdueAllocations.length;

  // Upcoming returns (due back date is today or later)
  const upcomingReturnsCount = allocations.filter(
    (a) => a.status === "Active" && a.expectedReturnDate && a.expectedReturnDate >= todayDate
  ).length;

  // Quick Action Modal states
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Forms states
  const [assetForm, setAssetForm] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    serialNumber: "",
    acquisitionDate: "2026-07-12",
    acquisitionCost: 0,
    condition: "Excellent" as const,
    location: "",
    isSharedBookable: false,
  });
  
  const [bookingForm, setBookingForm] = useState({
    assetId: assets.filter((a) => a.isSharedBookable)[0]?.id || "",
    bookedById: employees[0]?.id || "",
    startTime: "2026-07-12T10:00",
    endTime: "2026-07-12T11:00",
  });

  const [maintForm, setMaintForm] = useState({
    assetId: assets[0]?.id || "",
    raisedById: employees[0]?.id || "",
    description: "",
    priority: "Medium" as const,
  });

  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.serialNumber) return;
    
    registerAsset({
      ...assetForm,
      acquisitionCost: Number(assetForm.acquisitionCost),
      customData: {},
    });
    setAssetForm({
      name: "",
      categoryId: categories[0]?.id || "",
      serialNumber: "",
      acquisitionDate: "2026-07-12",
      acquisitionCost: 0,
      condition: "Excellent",
      location: "",
      isSharedBookable: false,
    });
    setShowAssetModal(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    const res = await createBooking({
      assetId: bookingForm.assetId,
      bookedById: bookingForm.bookedById,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
    });

    if (res.success) {
      setModalSuccess("Booking created successfully!");
      setTimeout(() => {
        setShowBookingModal(false);
        setModalSuccess("");
      }, 1000);
    } else {
      setModalError(res.error || "Booking failed.");
    }
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.description) return;

    raiseMaintenance(maintForm);
    setMaintForm({
      assetId: assets[0]?.id || "",
      raisedById: employees[0]?.id || "",
      description: "",
      priority: "Medium",
    });
    setShowMaintenanceModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-blue-100">
            <Zap className="w-3 h-3 fill-blue-600" /> Real-time System
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Today's Overview</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">Live monitoring of your physical assets, resource availability, and active schedules across all departments.</p>
        </div>

        {/* Quick Action Panel - Moved to top for better UX */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Book Resource</span>
          </button>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Raise Request</span>
          </button>
        </div>
      </div>

      {/* Overdue Return Flagged Alert Banner */}
      {overdueCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div className="p-2.5 bg-white rounded-xl text-rose-500 shrink-0 shadow-sm border border-rose-100 group-hover:scale-110 group-hover:rotate-12 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-rose-900 text-sm flex items-center gap-2">
              Action Required: {overdueCount} asset{overdueCount > 1 ? "s" : ""} overdue for return
            </h4>
            <p className="text-xs text-rose-700/80 mt-1 font-medium max-w-3xl">
              Certain employees are holding temporary assets beyond their Expected Return Date. Flagged for immediate follow-up.
            </p>
            <div className="mt-3">
              <Link href="/allocations" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-rose-600 hover:text-rose-700 font-bold shadow-sm border border-rose-100 hover:border-rose-300 transition-all">
                <span>Review Allocations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid - Rich Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Available Assets</p>
              <h3 className="text-4xl font-black text-slate-800">{availableCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ready for assignment</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Allocated Assets</p>
              <h3 className="text-4xl font-black text-slate-800">{allocatedCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>In active operations</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <FolderMinus className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Maintenance</p>
              <h3 className="text-4xl font-black text-slate-800">{maintenanceCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Currently in repair</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">Active Bookings</p>
              <h3 className="text-4xl font-black text-slate-800">{activeBookingsCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>Shared schedules today</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-cyan-600 transition-colors">Pending Transfers</p>
              <h3 className="text-4xl font-black text-slate-800">{pendingTransfersCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                <span>Requires approval</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform group-hover:rotate-180 duration-500">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-colors" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-slate-700 transition-colors">Upcoming Returns</p>
              <h3 className="text-4xl font-black text-slate-800">{upcomingReturnsCount}</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Temp assets due back</span>
              </p>
            </div>
            <div className="p-3.5 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl text-white shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid & Simulator Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-7 shadow-sm flex flex-col h-[420px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10 border-b border-slate-100 pb-4">
            <h4 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Activity Feed
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-4 relative z-10 custom-scrollbar relative">
            <div className="absolute top-0 left-[11px] bottom-0 w-px bg-slate-200" /> {/* Timeline line */}
            <div className="space-y-6">
              {activityLogs.slice(0, 10).map((log, index) => (
                <div key={log.id} className="flex gap-5 items-start relative group">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-slate-100 group-hover:border-blue-100 flex items-center justify-center shrink-0 z-10 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-blue-100/50 transition-all">
                    <p className="text-sm text-slate-800 font-semibold leading-snug">{log.details}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-blue-600 font-bold">{log.actorName}</p>
                      <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-[#0a0a0a] rounded-3xl border border-slate-800/80 p-7 shadow-2xl text-white flex flex-col justify-between h-[420px] relative overflow-hidden group">
          {/* Animated background glow */}
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 border border-white/20 text-white rounded-xl shrink-0 backdrop-blur-md shadow-lg shadow-black/50 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-black text-lg tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Simulator Info</span>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                This dashboard reflects mock transactions stored in your browser's <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs border border-white/10">localStorage</code>.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 backdrop-blur-sm">
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">How to test roles:</p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside font-medium">
                  <li>Use the user-role selector in the top Navbar.</li>
                  <li>Toggle between Admin, Manager, and Employees.</li>
                  <li>Observe state reactivity and permissions.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-5 flex justify-between items-center text-xs font-bold text-slate-500 relative z-10 uppercase tracking-widest">
            <span>Sys Time: 2026</span>
            <span className="bg-white/10 px-2 py-1 rounded-md text-white">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals & Forms (Redesigned) */}
      {/* ---------------------------------------------------- */}
      
      {/* Register Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                Register New Asset
              </h3>
              <button onClick={() => setShowAssetModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAssetSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5440"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category</label>
                  <select
                    value={assetForm.categoryId}
                    onChange={(e) => setAssetForm({ ...assetForm, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-XYZ-99"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Acquisition Date</label>
                  <input
                    type="date"
                    value={assetForm.acquisitionDate}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Cost (USD)</label>
                  <input
                    type="number"
                    value={assetForm.acquisitionCost}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 2 Conference Room A"
                  value={assetForm.location}
                  onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={assetForm.isSharedBookable}
                    onChange={(e) => setAssetForm({ ...assetForm, isSharedBookable: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Mark as shared/bookable resource</p>
                  <p className="text-[10px] text-slate-500 font-medium">Allows employees to book time slots for this asset.</p>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Resource Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                Book Shared Resource
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
              {modalError && (
                <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-600 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4" /> {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-600 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <CheckCircle className="w-4 h-4" /> {modalSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Select Resource</label>
                <select
                  value={bookingForm.assetId}
                  onChange={(e) => setBookingForm({ ...bookingForm, assetId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {assets.filter((a) => a.isSharedBookable).map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Booked By</label>
                <select
                  value={bookingForm.bookedById}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookedById: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Maintenance Request Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                  <Wrench className="w-4 h-4" />
                </div>
                Raise Maintenance Request
              </h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Select Asset</label>
                <select
                  value={maintForm.assetId}
                  onChange={(e) => setMaintForm({ ...maintForm, assetId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Reported By</label>
                  <select
                    value={maintForm.raisedById}
                    onChange={(e) => setMaintForm({ ...maintForm, raisedById: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Priority</label>
                  <select
                    value={maintForm.priority}
                    onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Describe Issue</label>
                <textarea
                  required
                  placeholder="Provide details about the issue..."
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
