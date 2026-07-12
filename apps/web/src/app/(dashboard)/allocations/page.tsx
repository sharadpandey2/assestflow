"use client";

import React, { useState } from "react";
import { useApp, AssetAllocation, TransferRequest } from "@/context/AppContext";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  AlertTriangle,
  FolderMinus,
  Check,
  X,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function AllocationsPage() {
  const {
    currentUser,
    assets,
    allocations,
    transferRequests,
    employees,
    departments,
    allocateAsset,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    returnAsset,
  } = useApp();

  // Dialog & Modal states
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [activeReturnAlloc, setActiveReturnAlloc] = useState<AssetAllocation | null>(null);

  // Form states
  const [allocForm, setAllocForm] = useState({
    assetId: "",
    targetType: "Employee" as "Employee" | "Department",
    targetId: "",
    expectedReturnDate: "",
  });

  const [returnForm, setReturnForm] = useState({
    condition: "Good",
    notes: "",
  });

  // Conflict Handling State
  const [conflictError, setConflictError] = useState("");
  const [conflictedAssetId, setConflictedAssetId] = useState("");

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError("");
    setConflictedAssetId("");

    if (!allocForm.assetId || !allocForm.targetId) return;

    // Check if asset is already allocated
    const asset = assets.find((a) => a.id === allocForm.assetId);
    if (asset && asset.status !== "Available") {
      // Trigger conflict logic
      const activeAlloc = allocations.find((al) => al.assetId === allocForm.assetId && al.status === "Active");
      let holderName = "another user/department";
      if (activeAlloc) {
        if (activeAlloc.allocatedToType === "Employee") {
          holderName = employees.find((emp) => emp.id === activeAlloc.targetId)?.name || holderName;
        } else {
          holderName = departments.find((dept) => dept.id === activeAlloc.targetId)?.name || holderName;
        }
      }
      
      setConflictedAssetId(allocForm.assetId);
      setConflictError(`Conflict: "${asset.name}" is already taken and currently held by "${holderName}".`);
      return;
    }

    const res = allocateAsset(
      allocForm.assetId,
      allocForm.targetType,
      allocForm.targetId,
      allocForm.expectedReturnDate || undefined
    );

    if (res.success) {
      // Reset form
      setAllocForm({
        assetId: "",
        targetType: "Employee",
        targetId: "",
        expectedReturnDate: "",
      });
      setShowAllocModal(false);
    }
  };

  const handleRequestTransferClick = () => {
    if (!conflictedAssetId) return;
    requestTransfer(conflictedAssetId, allocForm.targetType, allocForm.targetId);
    // Reset states
    setAllocForm({
      assetId: "",
      targetType: "Employee",
      targetId: "",
      expectedReturnDate: "",
    });
    setConflictError("");
    setConflictedAssetId("");
    setShowAllocModal(false);
  };

  const handleReturnClick = (alloc: AssetAllocation) => {
    const asset = assets.find((a) => a.id === alloc.assetId);
    setReturnForm({
      condition: asset?.condition || "Good",
      notes: "",
    });
    setActiveReturnAlloc(alloc);
    setShowReturnModal(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnAlloc) return;

    returnAsset(activeReturnAlloc.id, returnForm.condition, returnForm.notes);
    setShowReturnModal(false);
    setActiveReturnAlloc(null);
  };

  // Helper resolvers
  const getAssetName = (id: string) => assets.find((a) => a.id === id)?.name || id;
  
  const getTargetName = (type: "Employee" | "Department", targetId: string) => {
    if (type === "Employee") {
      return employees.find((e) => e.id === targetId)?.name || "Unknown Employee";
    }
    return departments.find((d) => d.id === targetId)?.name || "Unknown Department";
  };

  const activeAllocations = allocations.filter((al) => al.status === "Active");
  const pendingRequests = transferRequests.filter((tr) => tr.status === "Pending");

  const todayStr = "2026-07-12";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
            <ArrowLeftRight className="w-3 h-3 text-indigo-600" /> Allocation Matrix
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Asset Allocation & Transfer</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Manage custody logs, request transfers, and process asset returns efficiently.</p>
        </div>
        <button
          onClick={() => setShowAllocModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Asset</span>
        </button>
      </div>

      {/* Main Grid: Left = Active Allocations, Right = Pending Transfer Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Active Allocations List (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden relative p-1">
            <div className="p-5 flex items-center justify-between border-b border-white/40">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <FolderMinus className="w-4 h-4 text-indigo-500" /> Active Custody Allocations
              </h3>
              <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{activeAllocations.length} Active</span>
            </div>
            
            {activeAllocations.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center border border-white/60 mb-4 shadow-inner">
                  <UserCheck className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium">No active custody allocations recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar p-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-100/50">
                      <th className="px-5 py-4">Asset Code</th>
                      <th className="px-5 py-4">Asset Name</th>
                      <th className="px-5 py-4">Allocated To</th>
                      <th className="px-5 py-4">Allocation Date</th>
                      <th className="px-5 py-4">Return Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/30">
                    {activeAllocations.map((alloc) => {
                      const isOverdue = alloc.expectedReturnDate && alloc.expectedReturnDate < todayStr;
                      return (
                        <tr key={alloc.id} className="hover:bg-white/80 hover:shadow-sm transition-all group">
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{alloc.assetId}</span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-sm">{getAssetName(alloc.assetId)}</td>
                          <td className="px-5 py-4">
                            <span className="flex flex-col">
                              <span className="font-bold text-slate-700 text-xs">{getTargetName(alloc.allocatedToType, alloc.targetId)}</span>
                              <span className="text-[9px] text-slate-400 font-black uppercase mt-0.5 tracking-wider">{alloc.allocatedToType}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs font-medium">{alloc.allocationDate}</td>
                          <td className="px-5 py-4">
                            {alloc.expectedReturnDate ? (
                              <span
                                className={`flex items-center gap-1.5 font-bold text-xs ${
                                  isOverdue ? "text-rose-600" : "text-slate-600"
                                }`}
                              >
                                {isOverdue ? (
                                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                                ) : (
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{alloc.expectedReturnDate}</span>
                                {isOverdue && <span className="text-[8px] bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded ml-1 uppercase tracking-wider text-rose-700">Overdue</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic font-medium">Indefinite</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {currentUser.role !== "Employee" && (
                              <button
                                onClick={() => handleReturnClick(alloc)}
                                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-indigo-600 transition-all shadow-sm"
                              >
                                Return Asset
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Transfer Request Queue (1/3 width) */}
        <div className="space-y-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm h-[520px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
              <div className="p-6 border-b border-white/40 flex justify-between items-center bg-gradient-to-r from-transparent to-blue-50/30">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500" /> Transfer Approvals
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm shadow-rose-500/40 animate-pulse">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {pendingRequests.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Check className="w-8 h-8 text-emerald-400/50 mb-3" />
                    <p className="text-xs font-bold text-slate-500">All caught up!</p>
                    <p className="text-[10px] mt-1">No pending transfer requests.</p>
                  </div>
                ) : (
                  pendingRequests.map((req) => {
                    const requesterName = employees.find((e) => e.id === req.requestedById)?.name || "Unknown";
                    const isManager = currentUser.role === "Asset Manager" || currentUser.role === "Department Head";
                    return (
                      <div key={req.id} className="p-4 border border-slate-100 rounded-2xl bg-white/80 shadow-sm space-y-3 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800 text-sm leading-tight">{getAssetName(req.assetId)}</p>
                          <span className="font-mono text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{req.assetId}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">From</p>
                            <p className="font-medium text-slate-700 truncate">{getTargetName(req.fromType, req.fromId)}</p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                          <div className="flex-1 p-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">To</p>
                            <p className="font-medium text-blue-700 truncate">{getTargetName(req.toType, req.toId)}</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-1 rounded inline-flex">
                          Requested by <span className="font-bold text-slate-700">{requesterName}</span>
                        </p>

                        {isManager && (
                          <div className="flex gap-2 pt-2 mt-2 border-t border-slate-100">
                            <button
                              onClick={() => approveTransfer(req.id)}
                              className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectTransfer(req.id)}
                              className="flex-1 flex justify-center items-center gap-1 px-3 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-[10px] text-blue-800 rounded-b-3xl border-t border-white/60 leading-tight flex gap-2 items-start z-10 font-medium">
              <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Managers can approve or reject transfers to cleanly update allocation records and maintain chain of custody.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals & Forms */}
      {/* ---------------------------------------------------- */}

      {/* Allocate Asset Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                Allocate Asset
              </h3>
              <button onClick={() => setShowAllocModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {conflictError ? (
                /* CONFLICT WARNING DIALOG */
                <div className="space-y-5 animate-in slide-in-from-right-4">
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl text-left flex gap-4 items-start shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-amber-100 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-900 text-sm">Double Allocation Conflict</h4>
                      <p className="text-xs text-amber-800/80 mt-1.5 font-medium leading-relaxed">{conflictError}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setConflictError("")}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestTransferClick}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Request Transfer</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* MAIN FORM */
                <form onSubmit={handleAllocateSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Select Asset</label>
                    <select
                      value={allocForm.assetId}
                      onChange={(e) => setAllocForm({ ...allocForm, assetId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="">Choose Asset</option>
                      {assets.filter((a) => !a.isSharedBookable).map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Allocate To</label>
                      <select
                        value={allocForm.targetType}
                        onChange={(e) => setAllocForm({ ...allocForm, targetType: e.target.value as any, targetId: "" })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Department">Department</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Destination Target</label>
                      <select
                        value={allocForm.targetId}
                        onChange={(e) => setAllocForm({ ...allocForm, targetId: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select...</option>
                        {allocForm.targetType === "Employee"
                          ? employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)
                          : departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Return Date (Optional)</label>
                    <input
                      type="date"
                      value={allocForm.expectedReturnDate}
                      onChange={(e) => setAllocForm({ ...allocForm, expectedReturnDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAllocModal(false)}
                      className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
                    >
                      Allocate Asset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && activeReturnAlloc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Check className="w-4 h-4" />
                </div>
                Process Asset Return
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleReturnSubmit} className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-left space-y-2">
                <p className="font-extrabold text-slate-800 text-sm">Asset: {getAssetName(activeReturnAlloc.assetId)} <span className="font-mono text-xs text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 ml-1">{activeReturnAlloc.assetId}</span></p>
                <p className="text-xs text-slate-500 font-medium">Currently held by: <span className="font-bold text-slate-700">{getTargetName(activeReturnAlloc.allocatedToType, activeReturnAlloc.targetId)}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Condition check-in</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Check-in Notes</label>
                <textarea
                  placeholder="Record any damage, software cleanup, or general return notes..."
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
