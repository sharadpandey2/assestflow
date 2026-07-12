"use client";

import React, { useState } from "react";
import { useApp, AuditCycle, Asset } from "@/context/AppContext";
import {
  ShieldCheck,
  Plus,
  Users,
  AlertTriangle,
  Lock,
  CheckCircle,
  Eye,
  Info,
  Layers,
  MapPin,
  Calendar,
  X
} from "lucide-react";

export default function AuditsPage() {
  const {
    currentUser,
    assets,
    allocations,
    auditCycles,
    employees,
    departments,
    createAuditCycle,
    submitAuditRecord,
    closeAuditCycle,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  // Form states
  const [auditForm, setAuditForm] = useState({
    name: "",
    scopeType: "Department" as "Department" | "Location" | "Global",
    scopeValue: "",
    startDate: "2026-07-12",
    endDate: "2026-07-19",
    auditorIds: [] as string[],
  });

  const [recordForm, setRecordForm] = useState({
    assetId: "",
    status: "Verified" as "Verified" | "Missing" | "Damaged",
    notes: "",
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.name) return;

    createAuditCycle({
      name: auditForm.name,
      scopeType: auditForm.scopeType,
      scopeValue: auditForm.scopeValue || "Global",
      startDate: auditForm.startDate,
      endDate: auditForm.endDate,
      auditorIds: auditForm.auditorIds.length > 0 ? auditForm.auditorIds : [currentUser.id],
    });

    // Reset Form
    setAuditForm({
      name: "",
      scopeType: "Department",
      scopeValue: "",
      startDate: "2026-07-12",
      endDate: "2026-07-19",
      auditorIds: [],
    });
    setShowCreateModal(false);
  };

  const handleAuditorSelect = (empId: string) => {
    const isSelected = auditForm.auditorIds.includes(empId);
    if (isSelected) {
      setAuditForm({
        ...auditForm,
        auditorIds: auditForm.auditorIds.filter((id) => id !== empId),
      });
    } else {
      setAuditForm({
        ...auditForm,
        auditorIds: [...auditForm.auditorIds, empId],
      });
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuditId || !recordForm.assetId) return;

    submitAuditRecord(activeAuditId, recordForm.assetId, recordForm.status, recordForm.notes);
    
    // Reset Record inputs
    setRecordForm({
      assetId: "",
      status: "Verified",
      notes: "",
    });
  };

  // Scoped Assets list for an active audit
  const getScopedAssets = (cycle: AuditCycle): Asset[] => {
    if (cycle.scopeType === "Global") return assets;
    if (cycle.scopeType === "Department") {
      const deptEmpIds = employees.filter((e) => e.departmentId === cycle.scopeValue).map((e) => e.id);
      
      return assets.filter((asset) => {
        if (asset.categoryId === "cat-4") return false; // Exclude rooms
        
        const alloc = allocations.find(a => a.assetId === asset.id && a.status === "Active");
        if (alloc) {
           return (alloc.allocatedToType === "Employee" && deptEmpIds.includes(alloc.targetId)) || 
                  (alloc.allocatedToType === "Department" && alloc.targetId === cycle.scopeValue);
        }
        return false;
      });
    }
    // Location match
    return assets.filter((asset) => asset.location.toLowerCase().includes(cycle.scopeValue.toLowerCase()));
  };

  const activeAudit = auditCycles.find((c) => c.id === activeAuditId);
  const scopedAssets = activeAudit ? getScopedAssets(activeAudit) : [];

  const getDepartmentName = (id: string) => departments.find((d) => d.id === id)?.name || id;

  const getAuditorsNames = (ids: string[]) => {
    return ids.map((id) => employees.find((e) => e.id === id)?.name || id).join(", ");
  };

  const isAdminOrManager = currentUser.role === "Admin" || currentUser.role === "Asset Manager";

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Asset Audit Cycles</h1>
          <p className="text-xs text-slate-500 mt-1">Conduct scheduled inventory verification, log missing hardware, and lock cycles.</p>
        </div>
        {isAdminOrManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Audit Cycle</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left = Audit list / Detail view, Right = Auditor execution panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Active / Closed Audit cycles (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Verification Cycles</h3>
            {auditCycles.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">No audit cycles created yet.</p>
            ) : (
              <div className="space-y-4">
                {auditCycles.map((cycle) => {
                  const isSelected = cycle.id === activeAuditId;
                  const totalCount = getScopedAssets(cycle).length;
                  const auditedCount = Object.keys(cycle.records).length;
                  const progressPct = totalCount > 0 ? Math.round((auditedCount / totalCount) * 100) : 0;
                  const isClosed = cycle.status === "Closed";

                  return (
                    <div
                      key={cycle.id}
                      className={`p-5 border rounded-2xl text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600"
                          : "border-slate-200 bg-slate-50/20 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{cycle.name}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[10px] text-slate-450 font-semibold uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              Scope: {cycle.scopeType} ({cycle.scopeType === "Department" ? getDepartmentName(cycle.scopeValue) : cycle.scopeValue})
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              Auditors: {getAuditorsNames(cycle.auditorIds)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isClosed ? "bg-slate-100 text-slate-550" : "bg-green-50 text-green-600 animate-pulse"
                          }`}
                        >
                          {cycle.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Verification Progress</span>
                          <span>{auditedCount} / {totalCount} Assets ({progressPct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-350 ${
                              isClosed ? "bg-slate-400" : "bg-blue-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center">
                        <button
                          onClick={() => setActiveAuditId(cycle.id)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Inspect Audit</span>
                        </button>
                        {!isClosed && isAdminOrManager && progressPct >= 50 && (
                          <button
                            onClick={() => {
                              if (confirm("Close audit? Missing assets will status update to Lost, and damaged assets will raise repairs.")) {
                                closeAuditCycle(cycle.id);
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold shadow-xs"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Close Cycle</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution View (1/3 width) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
            {activeAudit ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Verification Panel</h3>
                  <button
                    onClick={() => setActiveAuditId(null)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeAudit.status === "Closed" ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Lock className="w-8 h-8 text-slate-350 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Audit Cycle Closed</p>
                    <p className="text-[10px] text-slate-450">This audit has been reconciled and locked.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRecordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select Asset to Verify</label>
                      <select
                        value={recordForm.assetId}
                        onChange={(e) => {
                          const record = activeAudit.records[e.target.value];
                          setRecordForm({
                            assetId: e.target.value,
                            status: record?.status || "Verified",
                            notes: record?.notes || "",
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                        required
                      >
                        <option value="">Select Asset...</option>
                        {scopedAssets.map((asset) => {
                          const isAudited = !!activeAudit.records[asset.id];
                          return (
                            <option key={asset.id} value={asset.id}>
                              {asset.name} ({asset.id}) {isAudited ? "✓ Verified" : "• Pending"}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {recordForm.assetId && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Status</label>
                          <select
                            value={recordForm.status}
                            onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                          >
                            <option value="Verified">Verified (Healthy)</option>
                            <option value="Missing">Missing (Lost/Stolen)</option>
                            <option value="Damaged">Damaged (Requires Repair)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Notes</label>
                          <textarea
                            placeholder="Add notes (e.g. software check, screen cracks, or physical location status)..."
                            value={recordForm.notes}
                            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Submit Record
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">No active inspection selected.</p>
                <p className="text-[10px] text-slate-450">Click "Inspect Audit" on a cycle card to record verifications.</p>
              </div>
            )}

            <div className="p-3 bg-blue-50/30 text-[10px] text-slate-500 rounded-xl leading-4 flex gap-1.5 items-start mt-6">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Assigned auditors mark scoped items verified. Closing updates missing items to "Lost" automatically.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Create Audit Cycle Modal */}
      {/* ---------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Create Audit Cycle</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cycle Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 IT Hardware Audit"
                  value={auditForm.name}
                  onChange={(e) => setAuditForm({ ...auditForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scope Level</label>
                  <select
                    value={auditForm.scopeType}
                    onChange={(e) => setAuditForm({ ...auditForm, scopeType: e.target.value as any, scopeValue: "" })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Department">Department-wise</option>
                    <option value="Location">Location-wise</option>
                    <option value="Global">Global (All Assets)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scope Value</label>
                  {auditForm.scopeType === "Department" ? (
                    <select
                      value={auditForm.scopeValue}
                      onChange={(e) => setAuditForm({ ...auditForm, scopeValue: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                      required
                    >
                      <option value="">Select Dept...</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : auditForm.scopeType === "Location" ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Floor 3"
                      value={auditForm.scopeValue}
                      onChange={(e) => setAuditForm({ ...auditForm, scopeValue: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="Global Audit Scope"
                      className="w-full px-3 py-2 border border-slate-250 bg-slate-50 text-slate-400 rounded-lg text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={auditForm.startDate}
                    onChange={(e) => setAuditForm({ ...auditForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={auditForm.endDate}
                    onChange={(e) => setAuditForm({ ...auditForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Auditor Multi-select list */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Assign Scoped Auditors</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 divide-y divide-slate-100 bg-slate-50/30">
                  {employees.map((emp) => {
                    const isChecked = auditForm.auditorIds.includes(emp.id);
                    return (
                      <div key={emp.id} className="flex items-center gap-2.5 py-1.5 px-1">
                        <input
                          type="checkbox"
                          id={`auditorChk-${emp.id}`}
                          checked={isChecked}
                          onChange={() => handleAuditorSelect(emp.id)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <label htmlFor={`auditorChk-${emp.id}`} className="text-xs text-slate-700 font-medium select-none cursor-pointer">
                          {emp.name} ({emp.role})
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
