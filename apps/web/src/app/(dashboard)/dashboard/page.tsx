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
  Wrench
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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    const res = createBooking({
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
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Today's Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time status of your physical assets and shared resources.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Available Assets</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{availableCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Ready for assignment</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <FolderMinus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Allocated Assets</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{allocatedCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">In active operational use</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Under Maintenance</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{maintenanceCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Currently in repair shop</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Bookings</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{activeBookingsCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Shared resource schedules today</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-purple-50 rounded-xl text-purple-600 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Transfers</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{pendingTransfersCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Requires approval/routing</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-slate-50 rounded-xl text-slate-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Upcoming Returns</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{upcomingReturnsCount}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Temporary assets due back</p>
          </div>
        </div>
      </div>

      {/* Overdue Return Flagged Alert Banner */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5 animate-bounce">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 text-sm">{overdueCount} asset{overdueCount > 1 ? "s" : ""} overdue for return</h4>
            <p className="text-xs text-slate-500 mt-1">
              Certain employees are holding temporary assets beyond their Expected Return Date. Flagged for immediate follow-up.
            </p>
            <div className="mt-3">
              <Link href="/allocations" className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1">
                <span>Go to Allocations Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h4>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Book Resource</span>
          </button>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>Raise Request</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Grid & Charts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[380px]">
          <h4 className="font-bold text-slate-800 text-sm mb-4">Recent Activity</h4>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex gap-4 items-start text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-800 font-semibold">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    By {log.actorName} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-md text-white flex flex-col justify-between h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600/30 border border-blue-500/20 text-blue-400 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm tracking-tight uppercase text-slate-300">Hackathon Simulator Info</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This client-side dashboard reflects mock transactions stored directly in your browser's <code className="bg-slate-800/80 px-1 py-0.5 rounded text-blue-400 font-mono text-[10px]">localStorage</code>.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              To trigger different permission views or complete workflows:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Use the user-role selector in the sticky top Navbar.</li>
              <li>Toggle between Admin, Asset Manager, and Employees.</li>
              <li>Add or modify data under one persona, then observe state reactivity across the system.</li>
            </ul>
          </div>
          <div className="border-t border-slate-700/60 pt-4 flex justify-between items-center text-[10px] text-slate-500">
            <span>System Time: 2026-07-12</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals & Forms */}
      {/* ---------------------------------------------------- */}
      
      {/* Register Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Register New Asset</h3>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5440"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={assetForm.categoryId}
                    onChange={(e) => setAssetForm({ ...assetForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-XYZ-99"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Acquisition Date</label>
                  <input
                    type="date"
                    value={assetForm.acquisitionDate}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    value={assetForm.acquisitionCost}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 2 Conference Room A"
                  value={assetForm.location}
                  onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bookableCheck"
                  checked={assetForm.isSharedBookable}
                  onChange={(e) => setAssetForm({ ...assetForm, isSharedBookable: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="bookableCheck" className="text-xs text-slate-600 font-semibold select-none">
                  Mark as shared/bookable resource
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Book Shared Resource</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-lg font-semibold">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-xs text-green-600 rounded-lg font-semibold">
                  {modalSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Resource</label>
                <select
                  value={bookingForm.assetId}
                  onChange={(e) => setBookingForm({ ...bookingForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {assets.filter((a) => a.isSharedBookable).map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Booked By (Simulated User)</label>
                <select
                  value={bookingForm.bookedById}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookedById: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Raise Maintenance Request</h3>
            <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Asset</label>
                <select
                  value={maintForm.assetId}
                  onChange={(e) => setMaintForm({ ...maintForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Reported By</label>
                  <select
                    value={maintForm.raisedById}
                    onChange={(e) => setMaintForm({ ...maintForm, raisedById: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select
                    value={maintForm.priority}
                    onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Describe Issue</label>
                <textarea
                  required
                  placeholder="Describe details of failure or required maintenance work..."
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
