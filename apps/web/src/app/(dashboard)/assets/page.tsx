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
  DollarSign,
  Box,
  CheckCircle
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
        return "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-500/10";
      case "Allocated":
        return "bg-blue-100/80 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-500/10";
      case "Reserved":
        return "bg-amber-100/80 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/10";
      case "Under Maintenance":
        return "bg-purple-100/80 text-purple-700 border border-purple-200/50 shadow-sm shadow-purple-500/10";
      case "Lost":
        return "bg-red-100/80 text-red-700 border border-red-200/50 shadow-sm shadow-red-500/10";
      default:
        return "bg-slate-100/80 text-slate-600 border border-slate-200/50 shadow-sm";
    }
  };

  const selectedCategoryFields = categories.find((c) => c.id === regForm.categoryId)?.fields || [];

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-10rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Directory Area */}
      <div className="flex-1 space-y-6 min-w-0">
        
        {/* Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-blue-100">
              <Box className="w-3 h-3 fill-blue-600" /> Asset Registry
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Assets Directory</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Register, track, search, and manage lifecycle events for physical equipment.</p>
          </div>
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>

        {/* Filter Toolbar - Glassmorphic */}
        <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm flex flex-wrap gap-4 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
          
          {/* Search bar */}
          <div className="flex-1 min-w-[200px] relative z-10 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by Tag, Serial, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-3 z-10">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
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
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
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
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Listing Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden">
          {filteredAssets.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                <Box className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">No assets match the active search/filters criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Asset Tag</th>
                    <th className="px-6 py-4">Asset Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Serial Number</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredAssets.map((asset) => {
                    const catName = categories.find((c) => c.id === asset.categoryId)?.name || "Other";
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? "bg-blue-50/40 relative z-10 shadow-[0_0_15px_rgba(0,0,0,0.03)] scale-[1.002]" 
                            : "hover:bg-white hover:shadow-sm hover:scale-[1.001]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100/50">{asset.id}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{asset.name}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">{catName}</td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{asset.serialNumber}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              asset.condition === "Excellent"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                                : asset.condition === "Good"
                                ? "bg-teal-50 text-teal-600 border border-teal-100/50"
                                : asset.condition === "Fair"
                                ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                                : "bg-red-50 text-red-600 border border-red-100/50"
                            }`}
                          >
                            {asset.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">{asset.location}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              asset.isSharedBookable ? "bg-indigo-50 text-indigo-500 border border-indigo-100/50" : "bg-slate-100 text-slate-400 border border-slate-200/50"
                            }`}
                          >
                            {asset.isSharedBookable ? "Shared" : "Exclusive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusBadgeColor(asset.status)}`}>
                            {asset.status === "Available" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
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
        <div className="w-[360px] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 shrink-0 flex flex-col justify-between h-[calc(100vh-12rem)] sticky top-24 animate-in slide-in-from-right-8 duration-300">
          <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent rounded-t-3xl pointer-events-none" />
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <p className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-2">{selectedAsset.id}</p>
                <h3 className="font-extrabold text-slate-800 text-xl tracking-tight leading-tight">{selectedAsset.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors bg-white shadow-sm border border-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick specifications */}
            <div className="space-y-4 text-xs bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Serial Number</span>
                <span className="font-mono text-slate-800 font-bold bg-white px-2 py-1 rounded border border-slate-100">{selectedAsset.serialNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Acquisition Cost</span>
                <span className="text-slate-800 font-extrabold text-sm">${selectedAsset.acquisitionCost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Acquisition Date</span>
                <span className="text-slate-700 font-semibold">{selectedAsset.acquisitionDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Location</span>
                <span className="text-slate-700 font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{selectedAsset.location}</span>
              </div>

              {/* Custom Category Fields */}
              {Object.keys(selectedAsset.customData).length > 0 && (
                <div className="pt-3 border-t border-slate-200/60 space-y-3 mt-2">
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Category Specs
                  </p>
                  {Object.entries(selectedAsset.customData).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px] items-center">
                      <span className="text-slate-500 font-semibold">{k}</span>
                      <span className="font-bold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asset history tabs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-black uppercase tracking-wider text-[10px] mb-3">
                <History className="w-3.5 h-3.5 text-blue-500" />
                <span>Allocation Log</span>
              </div>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {getAssetAllocationHistory(selectedAsset.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic font-medium ml-6">No allocation logs recorded.</p>
                ) : (
                  getAssetAllocationHistory(selectedAsset.id).map((h) => (
                    <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-200 group-hover:bg-blue-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 bg-white shadow-sm space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
                          <span className="truncate">{h.holderName}</span>
                          <span className={`px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] ${
                            h.status === "Active" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-100 text-slate-500"
                          }`}>{h.status}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">
                          Assign: <span className="text-slate-600">{h.date}</span> <br/> Return: <span className="text-slate-600">{h.returnDate}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700 font-black uppercase tracking-wider text-[10px] mb-3">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Maintenance Log</span>
              </div>
              <div className="space-y-3">
                {getAssetMaintenanceHistory(selectedAsset.id).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic font-medium ml-2">No repair logs recorded.</p>
                ) : (
                  getAssetMaintenanceHistory(selectedAsset.id).map((m) => (
                    <div key={m.id} className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm space-y-2 hover:border-amber-200 transition-colors group">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span className="truncate max-w-[200px] leading-tight group-hover:text-amber-700 transition-colors">{m.description}</span>
                        <span className={`px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] shrink-0 ${
                          m.status === "Resolved" ? "bg-green-50 text-green-600 border border-green-100" : "bg-purple-50 text-purple-600 border border-purple-100"
                        }`}>{m.status}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Opened: <span className="text-slate-600">{new Date(m.createdAt).toLocaleDateString()}</span>
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
      {/* Asset Registration Modal (Premium Design) */}
      {/* ---------------------------------------------------- */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                Register New Asset
              </h3>
              <button onClick={() => setShowRegModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5440"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category</label>
                  <select
                    value={regForm.categoryId}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value)}
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
                    value={regForm.serialNumber}
                    onChange={(e) => setRegForm({ ...regForm, serialNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Acquisition Date</label>
                  <input
                    type="date"
                    value={regForm.acquisitionDate}
                    onChange={(e) => setRegForm({ ...regForm, acquisitionDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Cost (USD)</label>
                  <input
                    type="number"
                    value={regForm.acquisitionCost}
                    onChange={(e) => setRegForm({ ...regForm, acquisitionCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 2 Conf A"
                    value={regForm.location}
                    onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Condition</label>
                  <select
                    value={regForm.condition}
                    onChange={(e) => setRegForm({ ...regForm, condition: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={regForm.isSharedBookable}
                    onChange={(e) => setRegForm({ ...regForm, isSharedBookable: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Mark as shared/bookable resource</p>
                  <p className="text-[10px] text-slate-500 font-medium">Allows employees to book time slots.</p>
                </div>
              </label>

              {/* Dynamic Category fields if available */}
              {selectedCategoryFields.length > 0 && (
                <div className="p-4 border border-slate-200/60 rounded-xl bg-slate-50/50 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider flex items-center gap-1.5 relative z-10">
                    <Layers className="w-3.5 h-3.5" /> Category Specifics
                  </p>
                  {selectedCategoryFields.map((field) => (
                    <div key={field.name} className="relative z-10">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">{field.name}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                        value={regForm.customData[field.name] || ""}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
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
