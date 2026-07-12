"use client";

import React, { useState } from "react";
import { useApp, Asset, AssetStatus } from "@/context/AppContext";
import {
  Search,
  Filter,
  Plus,
  Info,
  Calendar,
  Wrench,
  User,
  History,
  X,
  Sparkles,
  Layers,
  MapPin,
  Tag,
  DollarSign
} from "lucide-react";

export default function AssetsPage() {
  const {
    assets,
    categories,
    employees,
    departments,
    allocations,
    maintenanceRequests,
    registerAsset,
    editAsset,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Selected Asset details drawer state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Asset Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    categoryId: categories[0]?.id || "",
    serialNumber: "",
    acquisitionDate: "2026-07-12",
    acquisitionCost: 0,
    condition: "Excellent" as const,
    location: "",
    isSharedBookable: false,
    customData: {} as Record<string, string>,
  });

  const handleCategoryChangeInForm = (catId: string) => {
    // Reset customData on category change
    setRegForm({
      ...regForm,
      categoryId: catId,
      customData: {},
    });
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setRegForm({
      ...regForm,
      customData: {
        ...regForm.customData,
        [fieldName]: value,
      },
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.serialNumber) return;

    registerAsset({
      name: regForm.name,
      categoryId: regForm.categoryId,
      serialNumber: regForm.serialNumber,
      acquisitionDate: regForm.acquisitionDate,
      acquisitionCost: Number(regForm.acquisitionCost),
      condition: regForm.condition,
      location: regForm.location,
      isSharedBookable: regForm.isSharedBookable,
      customData: regForm.customData,
    });

    // Reset Form
    setRegForm({
      name: "",
      categoryId: categories[0]?.id || "",
      serialNumber: "",
      acquisitionDate: "2026-07-12",
      acquisitionCost: 0,
      condition: "Excellent",
      location: "",
      isSharedBookable: false,
      customData: {},
    });
    setShowRegModal(false);
  };

  // Filtered Assets
  const locations = Array.from(new Set(assets.map((a) => a.location)));

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || asset.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
    const matchesLocation = selectedLocation === "all" || asset.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  // Fetch histories for detail drawer
  const getAssetAllocationHistory = (assetId: string) => {
    return allocations
      .filter((al) => al.assetId === assetId)
      .map((al) => {
        let holderName = "Unknown";
        if (al.allocatedToType === "Employee") {
          holderName = employees.find((e) => e.id === al.targetId)?.name || holderName;
        } else {
          holderName = departments.find((d) => d.id === al.targetId)?.name || holderName;
        }
        return {
          id: al.id,
          holderName,
          type: al.allocatedToType,
          date: al.allocationDate,
          returnDate: al.actualReturnDate || al.expectedReturnDate || "Ongoing",
          status: al.status,
        };
      })
      .reverse(); // Newest first
  };

  const getAssetMaintenanceHistory = (assetId: string) => {
    return maintenanceRequests.filter((m) => m.assetId === assetId);
  };

  const getStatusBadgeColor = (status: AssetStatus) => {
    switch (status) {
      case "Available":
        return "bg-green-50 text-green-600 border border-green-100";
      case "Allocated":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Reserved":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Under Maintenance":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      case "Lost":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-200";
    }
  };

  const selectedCategoryFields = categories.find((c) => c.id === regForm.categoryId)?.fields || [];

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-10rem)]">
      {/* Main Directory Area */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assets Directory</h1>
            <p className="text-xs text-slate-500 mt-1">Register, track, search, and manage lifecycle events for physical equipment.</p>
          </div>
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-4 items-center">
          {/* Search bar */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Tag, Serial, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Directory Listing Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Info className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">No assets match the active search/filters criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Asset Tag</th>
                    <th className="p-3.5">Asset Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Serial Number</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Shared</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.map((asset) => {
                    const catName = categories.find((c) => c.id === asset.categoryId)?.name || "Other";
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          selectedAsset?.id === asset.id ? "bg-blue-50/20" : ""
                        }`}
                      >
                        <td className="p-3.5 font-mono font-bold text-blue-600">{asset.id}</td>
                        <td className="p-3.5 font-bold text-slate-700">{asset.name}</td>
                        <td className="p-3.5 text-slate-500">{catName}</td>
                        <td className="p-3.5 text-slate-400 font-mono">{asset.serialNumber}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              asset.condition === "Excellent"
                                ? "bg-emerald-50 text-emerald-600"
                                : asset.condition === "Good"
                                ? "bg-teal-50 text-teal-600"
                                : asset.condition === "Fair"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {asset.condition}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{asset.location}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              asset.isSharedBookable ? "bg-indigo-50 text-indigo-500" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {asset.isSharedBookable ? "Shared" : "Exclusive"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeColor(asset.status)}`}>
                            {asset.status}
                          </span>
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

      {/* Asset Details Drawer (opens on the right) */}
      {selectedAsset && (
        <div className="w-80 bg-white border border-slate-200 rounded-2xl shadow-lg p-5 shrink-0 flex flex-col justify-between h-[calc(100vh-12rem)] sticky top-24 fade-in">
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <p className="font-mono text-xs font-bold text-blue-600">{selectedAsset.id}</p>
                <h3 className="font-bold text-slate-800 text-sm mt-0.5">{selectedAsset.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick specifications */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Serial Number</span>
                <span className="font-mono text-slate-800 font-semibold">{selectedAsset.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Acquisition Cost</span>
                <span className="text-slate-800 font-semibold">${selectedAsset.acquisitionCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Acquisition Date</span>
                <span className="text-slate-800 font-semibold">{selectedAsset.acquisitionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Location</span>
                <span className="text-slate-800 font-semibold">{selectedAsset.location}</span>
              </div>

              {/* Custom Category Fields */}
              {Object.keys(selectedAsset.customData).length > 0 && (
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Specifications</p>
                  {Object.entries(selectedAsset.customData).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-semibold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asset history tabs */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <History className="w-3.5 h-3.5" />
                <span>Allocation History</span>
              </div>
              <div className="space-y-3">
                {getAssetAllocationHistory(selectedAsset.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No allocation logs recorded.</p>
                ) : (
                  getAssetAllocationHistory(selectedAsset.id).map((h) => (
                    <div key={h.id} className="p-2 border border-slate-100 rounded-lg bg-slate-50/50 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>{h.holderName}</span>
                        <span className={`px-1 py-0.5 rounded text-[8px] ${
                          h.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                        }`}>{h.status}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Assign: {h.date} • Return: {h.returnDate}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <Wrench className="w-3.5 h-3.5" />
                <span>Maintenance History</span>
              </div>
              <div className="space-y-3">
                {getAssetMaintenanceHistory(selectedAsset.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No repair logs recorded.</p>
                ) : (
                  getAssetMaintenanceHistory(selectedAsset.id).map((m) => (
                    <div key={m.id} className="p-2 border border-slate-100 rounded-lg bg-slate-50/50 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span className="truncate max-w-[120px]">{m.description}</span>
                        <span className={`px-1 py-0.5 rounded text-[8px] ${
                          m.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                        }`}>{m.status}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Opened: {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Asset Registration Modal */}
      {/* ---------------------------------------------------- */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Register New Asset</span>
            </h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5440"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={regForm.categoryId}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value)}
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
                    value={regForm.serialNumber}
                    onChange={(e) => setRegForm({ ...regForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Acquisition Date</label>
                  <input
                    type="date"
                    value={regForm.acquisitionDate}
                    onChange={(e) => setRegForm({ ...regForm, acquisitionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Acquisition Cost (USD)</label>
                  <input
                    type="number"
                    value={regForm.acquisitionCost}
                    onChange={(e) => setRegForm({ ...regForm, acquisitionCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 3 West Wing"
                    value={regForm.location}
                    onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Condition</label>
                  <select
                    value={regForm.condition}
                    onChange={(e) => setRegForm({ ...regForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="bookableCheckAssets"
                  checked={regForm.isSharedBookable}
                  onChange={(e) => setRegForm({ ...regForm, isSharedBookable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="bookableCheckAssets" className="text-xs text-slate-600 font-semibold select-none">
                  Mark as shared / bookable resource
                </label>
              </div>

              {/* Dynamic Category fields if available */}
              {selectedCategoryFields.length > 0 && (
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Specific Inputs</p>
                  {selectedCategoryFields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{field.name}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                        value={regForm.customData[field.name] || ""}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold animate-fadeIn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
