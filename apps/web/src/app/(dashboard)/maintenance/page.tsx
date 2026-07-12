"use client";

import React, { useState } from "react";
import { useApp, MaintenanceRequest } from "@/context/AppContext";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Play,
  ClipboardList,
  Sparkles,
  Info
} from "lucide-react";

export default function MaintenancePage() {
  const {
    currentUser,
    assets,
    maintenanceRequests,
    employees,
    raiseMaintenance,
    updateMaintenanceStatus,
  } = useApp();

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [maintForm, setMaintForm] = useState({
    assetId: assets[0]?.id || "",
    raisedById: currentUser.id,
    description: "",
    priority: "Medium" as const,
  });

  // Assign Technician Modal State
  const [activeAssignMaint, setActiveAssignMaint] = useState<MaintenanceRequest | null>(null);
  const [technicianName, setTechnicianName] = useState("");

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.description || !maintForm.assetId) return;

    raiseMaintenance({
      ...maintForm,
      raisedById: currentUser.id, // Current simulated user
    });

    setMaintForm({
      assetId: assets[0]?.id || "",
      raisedById: currentUser.id,
      description: "",
      priority: "Medium",
    });
    setShowMaintModal(false);
  };

  const handleApproveClick = (req: MaintenanceRequest) => {
    setActiveAssignMaint(req);
    setTechnicianName("");
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignMaint || !technicianName) return;

    // Approve request and assign technician
    updateMaintenanceStatus(activeAssignMaint.id, "Approved", technicianName);
    updateMaintenanceStatus(activeAssignMaint.id, "Technician Assigned");
    
    setActiveAssignMaint(null);
  };

  const handleRejectClick = (req: MaintenanceRequest) => {
    updateMaintenanceStatus(req.id, "Rejected");
  };

  const handleStartRepairClick = (req: MaintenanceRequest) => {
    updateMaintenanceStatus(req.id, "In Progress");
  };

  const handleResolveClick = (req: MaintenanceRequest) => {
    updateMaintenanceStatus(req.id, "Resolved");
  };

  const getAssetName = (id: string) => assets.find((a) => a.id === id)?.name || id;

  const getRaisedByName = (id: string) => employees.find((e) => e.id === id)?.name || "Unknown Employee";

  const getPriorityBadge = (priority: MaintenanceRequest["priority"]) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      case "High":
        return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Medium":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  // Group requests by state
  const requests = maintenanceRequests;
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const approvedRequests = requests.filter((r) => r.status === "Approved" || r.status === "Technician Assigned" || r.status === "In Progress");
  const completedRequests = requests.filter((r) => r.status === "Resolved" || r.status === "Rejected");

  const isManager = currentUser.role === "Asset Manager" || currentUser.role === "Admin";

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Maintenance Management</h1>
          <p className="text-xs text-slate-500 mt-1">Route hardware failures, dispatch repair technicians, and review asset resolution logs.</p>
        </div>
        <button
          onClick={() => setShowMaintModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Request</span>
        </button>
      </div>

      {/* Columns: Kanban-like grouping by status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Pending Approvals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-250 pb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pending Approval ({pendingRequests.length})</h3>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No pending requests.</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getPriorityBadge(req.priority)}`}>
                      {req.priority} Priority
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{req.assetId}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{getAssetName(req.assetId)}</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{req.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-450">
                    <span className="font-medium">By {getRaisedByName(req.raisedById)}</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Manager approval actions */}
                  {isManager && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveClick(req)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] text-center"
                      >
                        Approve & Assign
                      </button>
                      <button
                        onClick={() => handleRejectClick(req)}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-lg font-bold text-[10px]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Repair / Dispatched */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-250 pb-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">In Progress ({approvedRequests.length})</h3>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {approvedRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No active repairs.</p>
            ) : (
              approvedRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 text-left">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-600 font-bold uppercase tracking-wider">
                      {req.status}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{req.assetId}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{getAssetName(req.assetId)}</h4>
                    {req.assignedTechnician && (
                      <p className="text-[10px] text-slate-450 mt-1 bg-slate-50 border border-slate-100 p-1 rounded font-medium">
                        Technician: {req.assignedTechnician}
                      </p>
                    )}
                    <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">{req.description}</p>
                  </div>

                  {/* Repair progression actions */}
                  {isManager && (
                    <div className="pt-2 border-t border-slate-100 flex gap-2">
                      {req.status === "Technician Assigned" && (
                        <button
                          onClick={() => handleStartRepairClick(req)}
                          className="flex-1 py-1.5 bg-slate-850 hover:bg-slate-900 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          <span>Start Repair</span>
                        </button>
                      )}
                      {req.status === "In Progress" && (
                        <button
                          onClick={() => handleResolveClick(req)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Issue</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Reconciled logs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-250 pb-2">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Completed logs ({completedRequests.length})</h3>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {completedRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No completed records.</p>
            ) : (
              completedRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50/40 border border-slate-200/80 rounded-2xl space-y-3 opacity-80 text-left">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        req.status === "Resolved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{req.assetId}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{getAssetName(req.assetId)}</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{req.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-450 flex justify-between">
                    <span>By {getRaisedByName(req.raisedById)}</span>
                    <span>Done</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals */}
      {/* ---------------------------------------------------- */}

      {/* Raise Maintenance Modal */}
      {showMaintModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Raise Maintenance Request</h3>
            <form onSubmit={handleMaintSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Asset</label>
                <select
                  value={maintForm.assetId}
                  onChange={(e) => setMaintForm({ ...maintForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.status}</option>
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Describe Issue</label>
                <textarea
                  required
                  placeholder="Record failure specifics, error alerts, or required maintenance details..."
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
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

      {/* Assign Technician Modal */}
      {activeAssignMaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-2">Approve Request</h3>
            <p className="text-[11px] text-slate-450 mb-4">Assign a technician or vendor company to commence repair works.</p>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Technician Name / Agency</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RepairCo Services"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveAssignMaint(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Approve Repair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
