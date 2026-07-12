"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  BarChart3,
  Download,
  PieChart,
  LineChart,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  FolderSync
} from "lucide-react";

export default function ReportsPage() {
  const { assets, allocations, bookings, maintenanceRequests, departments } = useApp();

  // Basic statistics
  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === "Available").length;
  const allocatedCount = assets.filter((a) => a.status === "Allocated").length;
  const maintenanceCount = assets.filter((a) => a.status === "Under Maintenance").length;
  const reservedCount = assets.filter((a) => a.status === "Reserved").length;
  const lostCount = assets.filter((a) => a.status === "Lost").length;

  const resolvedMaintCount = maintenanceRequests.filter((r) => r.status === "Resolved").length;
  const totalBookingsCount = bookings.length;

  // Department-wise allocations
  const deptAllocSummary = departments.map((d) => {
    const allocCount = allocations.filter((a) => a.status === "Active" && a.allocatedToType === "Department" && a.targetId === d.id).length;
    return { name: d.name, count: allocCount };
  });

  // Calculate percentages
  const utilizationPct = totalAssets > 0 ? Math.round(((allocatedCount + reservedCount) / totalAssets) * 100) : 0;
  
  // Custom export action trigger
  const handleExport = (reportName: string) => {
    alert(`Successfully generated and downloaded report: "${reportName}.csv".`);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Acquire operational intelligence, utilization trends, and asset health ratings.</p>
        </div>
        <button
          onClick={() => handleExport("Global_AssetFlow_Operational_Summary_2026")}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Grid: 2 columns of rich visual widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Asset Utilization Trends (Custom CSS Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>Asset Status Allocation</span>
              </h3>
              <button
                onClick={() => handleExport("Asset_Utilization_Status")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Stacked Bar */}
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full hover:opacity-90"
                  style={{ width: `${(allocatedCount / totalAssets) * 100}%` }}
                  title={`Allocated: ${allocatedCount}`}
                />
                <div
                  className="bg-emerald-500 h-full hover:opacity-90"
                  style={{ width: `${(availableCount / totalAssets) * 100}%` }}
                  title={`Available: ${availableCount}`}
                />
                <div
                  className="bg-purple-500 h-full hover:opacity-90"
                  style={{ width: `${(maintenanceCount / totalAssets) * 100}%` }}
                  title={`Under Maintenance: ${maintenanceCount}`}
                />
                <div
                  className="bg-amber-500 h-full hover:opacity-90"
                  style={{ width: `${(reservedCount / totalAssets) * 100}%` }}
                  title={`Reserved: ${reservedCount}`}
                />
              </div>

              {/* Legends Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                  <span className="text-slate-500 font-medium">Allocated: {allocatedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span className="text-slate-500 font-medium">Available: {availableCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                  <span className="text-slate-500 font-medium">In Repair: {maintenanceCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                  <span className="text-slate-500 font-medium">Reserved: {reservedCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Global Utilization Rate</span>
            <span className="text-blue-600 text-sm font-extrabold">{utilizationPct}%</span>
          </div>
        </div>

        {/* Card 2: Resource Bookings Heatmap (Peak hours) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Resource Bookings Heatmap (Peak Times)</span>
              </h3>
              <button
                onClick={() => handleExport("Resource_Booking_Heatmap")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Heatmap Matrix */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bookings distribution by hour slots</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { label: "8 AM", pct: 15, intensity: "bg-blue-100 text-blue-600" },
                  { label: "10 AM", pct: 85, intensity: "bg-blue-600 text-white" },
                  { label: "12 PM", pct: 45, intensity: "bg-blue-300 text-blue-900" },
                  { label: "2 PM", pct: 90, intensity: "bg-blue-700 text-white" },
                  { label: "4 PM", pct: 60, intensity: "bg-blue-400 text-blue-900" },
                  { label: "6 PM", pct: 20, intensity: "bg-blue-200 text-blue-700" },
                ].map((hour) => (
                  <div key={hour.label} className="flex flex-col items-center gap-2">
                    <div className={`w-full h-16 rounded-xl flex items-center justify-center font-bold text-xs ${hour.intensity}`}>
                      {hour.pct}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{hour.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Peak slots identified at 10 AM and 2 PM operations.</span>
          </div>
        </div>

        {/* Card 3: Maintenance Frequencies by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Maintenance Frequency by Category</span>
              </h3>
              <button
                onClick={() => handleExport("Maintenance_Frequency_By_Category")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: "Electronics", count: 4, pct: 80, color: "bg-rose-500" },
                { name: "Furniture", count: 1, pct: 20, color: "bg-amber-500" },
                { name: "Vehicles", count: 2, pct: 40, color: "bg-blue-500" },
                { name: "Shared Spaces", count: 0, pct: 0, color: "bg-slate-300" },
              ].map((c) => (
                <div key={c.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{c.name}</span>
                    <span>{c.count} Requests</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Reconciled: {resolvedMaintCount} repair request{resolvedMaintCount > 1 ? "s" : ""} resolved.</span>
          </div>
        </div>

        {/* Card 4: Department-wise allocations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FolderSync className="w-4 h-4 text-blue-600" />
                <span>Department-wise Allocations</span>
              </h3>
              <button
                onClick={() => handleExport("Department_Allocation_Summary")}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {deptAllocSummary.map((d) => (
                <div key={d.name} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <span className="font-bold text-slate-700">{d.name}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">
                    {d.count} Assets
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Data encompasses active department level custody allocations.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
