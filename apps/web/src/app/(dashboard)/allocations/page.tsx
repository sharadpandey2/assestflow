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
  AlertCircle
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
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Asset Allocation & Transfer</h1>
          <p className="text-xs text-slate-500 mt-1">Manage custody logs, request transfers, and process asset returns.</p>
        </div>
        <button
          onClick={() => setShowAllocModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Asset</span>
        </button>
      </div>

      {/* Main Grid: Left = Active Allocations, Right = Pending Transfer Queue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Active Allocations List (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Active Custody allocations</h3>
            {activeAllocations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No active custody allocations recorded.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Asset Tag</th>
                      <th className="p-3.5">Asset Name</th>
                      <th className="p-3.5">Allocated To</th>
                      <th className="p-3.5">Allocation Date</th>
                      <th className="p-3.5">Expected Return Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeAllocations.map((alloc) => {
                      const isOverdue =
                        alloc.expectedReturnDate && alloc.expectedReturnDate < todayStr;
                      return (
                        <tr key={alloc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-blue-600">{alloc.assetId}</td>
                          <td className="p-3.5 font-bold text-slate-700">{getAssetName(alloc.assetId)}</td>
                          <td className="p-3.5 font-medium text-slate-700">
                            <span className="flex flex-col">
                              <span>{getTargetName(alloc.allocatedToType, alloc.targetId)}</span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{alloc.allocatedToType}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-550">{alloc.allocationDate}</td>
                          <td className="p-3.5">
                            {alloc.expectedReturnDate ? (
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  isOverdue ? "text-rose-600" : "text-slate-650"
                                }`}
                              >
                                {isOverdue && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                                <span>{alloc.expectedReturnDate}</span>
                                {isOverdue && <span className="text-[8px] bg-rose-100 px-1 py-0.5 rounded ml-1 uppercase">Overdue</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Indefinite</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {/* Return action button */}
                            {currentUser.role !== "Employee" && (
                              <button
                                onClick={() => handleReturnClick(alloc)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-700 border border-slate-200 hover:border-blue-600 transition-all"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[450px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100 pb-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Transfers Approval Queue</h3>
              </div>
              <div className="overflow-y-auto space-y-4 pr-1 max-h-[300px]">
                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center italic">No pending transfer requests.</p>
                ) : (
                  pendingRequests.map((req) => {
                    const requesterName = employees.find((e) => e.id === req.requestedById)?.name || "Unknown";
                    const isManager = currentUser.role === "Asset Manager" || currentUser.role === "Department Head";
                    return (
                      <div key={req.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 text-left">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">Asset: {getAssetName(req.assetId)} ({req.assetId})</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            From: {getTargetName(req.fromType, req.fromId)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            To: {getTargetName(req.toType, req.toId)}
                          </p>
                          <p className="text-[9px] text-blue-600 font-bold mt-1">Requested by: {requesterName}</p>
                        </div>
                        {isManager && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveTransfer(req.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => rejectTransfer(req.id)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="p-3 bg-blue-50/30 text-[10px] text-slate-500 rounded-xl leading-4 flex gap-1.5 items-start">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Managers can approve or reject transfers to cleanly update allocation files in one click.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals & Forms */}
      {/* ---------------------------------------------------- */}

      {/* Allocate Asset Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Allocate Asset</h3>
            
            {conflictError ? (
              /* CONFLICT WARNING DIALOG */
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Double Allocation Conflict</h4>
                    <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">{conflictError}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConflictError("")}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestTransferClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Request Transfer</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MAIN FORM */
              <form onSubmit={handleAllocateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Asset</label>
                  <select
                    value={allocForm.assetId}
                    onChange={(e) => setAllocForm({ ...allocForm, assetId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">Choose Asset</option>
                    {assets.filter((a) => !a.isSharedBookable).map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.status}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Allocate To</label>
                    <select
                      value={allocForm.targetType}
                      onChange={(e) => setAllocForm({ ...allocForm, targetType: e.target.value as any, targetId: "" })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Destination Target</label>
                    <select
                      value={allocForm.targetId}
                      onChange={(e) => setAllocForm({ ...allocForm, targetId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="">Select...</option>
                      {allocForm.targetType === "Employee"
                        ? employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)
                        : departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Return Date (Optional)</label>
                  <input
                    type="date"
                    value={allocForm.expectedReturnDate}
                    onChange={(e) => setAllocForm({ ...allocForm, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAllocModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Allocate Custody
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && activeReturnAlloc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Process Asset Return</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs space-y-1">
                <p className="font-bold text-slate-750">Asset: {getAssetName(activeReturnAlloc.assetId)} ({activeReturnAlloc.assetId})</p>
                <p className="text-slate-450">Currently held by: {getTargetName(activeReturnAlloc.allocatedToType, activeReturnAlloc.targetId)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Condition check-in</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Check-in Return Notes</label>
                <textarea
                  placeholder="Record any damage, software cleanup, or general return notes..."
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
