"use client";

import React, { useState } from "react";
import { useApp, Role, Department, AssetCategory, Employee } from "@/context/AppContext";
import { ShieldAlert, Users, Layers, Network, Plus, Shield, Award, Power, Edit3, Briefcase, Settings, X, Building2, UserPlus, Grid } from "lucide-react";

export default function OrganizationPage() {
  const {
    currentUser,
    employees,
    departments,
    categories,
    addDepartment,
    editDepartment,
    addCategory,
    addEmployee,
    editEmployee,
    promoteEmployee,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "employees">("departments");

  // Forms states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: "",
    headId: "",
    parentDepartmentId: "",
    status: "Active" as const,
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [customFields, setCustomFields] = useState<{ name: string; type: string; required: boolean }[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldReq, setNewFieldReq] = useState(false);

  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({
    name: "",
    email: "",
    departmentId: "",
    role: "Employee" as Role,
    status: "Active" as const,
  });

  // Security Gate
  if (currentUser.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] animate-in fade-in duration-500">
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 p-12 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-colors" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
          
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-rose-50 border-2 border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto shadow-inner shadow-rose-500/20 relative">
              <div className="absolute inset-0 rounded-full border border-rose-200 animate-ping opacity-20" />
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-2xl tracking-tight">Access Restricted</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Only users with <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 mx-1">Admin</span> privileges can view or modify Organization master setups.
              </p>
            </div>
            <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl">
              <p className="text-xs text-slate-500 font-medium">
                Use the <strong className="text-slate-700">Simulator Switcher</strong> at the top right to log in as an Admin (e.g. Abhinav Tyagi) to test this module.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Department Actions
  // ----------------------------------------------------
  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) return;
    addDepartment({
      name: deptForm.name,
      headId: deptForm.headId || employees[0]?.id || "",
      parentDepartmentId: deptForm.parentDepartmentId || undefined,
      status: deptForm.status,
    });
    setDeptForm({ name: "", headId: "", parentDepartmentId: "", status: "Active" });
    setShowDeptModal(false);
  };

  const toggleDeptStatus = (dept: Department) => {
    editDepartment(dept.id, {
      status: dept.status === "Active" ? "Inactive" : "Active",
    });
  };

  // ----------------------------------------------------
  // Category Actions
  // ----------------------------------------------------
  const addFieldToDraft = () => {
    if (!newFieldName) return;
    setCustomFields([...customFields, { name: newFieldName, type: newFieldType, required: newFieldReq }]);
    setNewFieldName("");
    setNewFieldReq(false);
  };

  const removeFieldFromDraft = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    addCategory({
      name: catName,
      fields: customFields,
    });
    setCatName("");
    setCustomFields([]);
    setShowCatModal(false);
  };

  // ----------------------------------------------------
  // Employee Actions
  // ----------------------------------------------------
  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.email) return;
    addEmployee({
      name: empForm.name,
      email: empForm.email,
      departmentId: empForm.departmentId || departments[0]?.id || "",
      role: empForm.role,
      status: empForm.status,
    });
    setEmpForm({ name: "", email: "", departmentId: "", role: "Employee", status: "Active" });
    setShowEmpModal(false);
  };

  const toggleEmpStatus = (emp: Employee) => {
    editEmployee(emp.id, {
      status: emp.status === "Active" ? "Inactive" : "Active",
    });
  };

  const handleRoleChange = (empId: string, role: Role) => {
    promoteEmployee(empId, role);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-purple-100">
            <Settings className="w-3 h-3 text-purple-600" /> Admin Controls
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Organization Setup</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Configure department structures, asset schemas, and employee credentials.</p>
        </div>
      </div>

      {/* Tabs Menu - Glassmorphic */}
      <div className="flex gap-2 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "departments"
              ? "bg-white text-blue-600 shadow-sm border border-slate-100/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Departments</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "categories"
              ? "bg-white text-blue-600 shadow-sm border border-slate-100/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Asset Categories</span>
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "employees"
              ? "bg-white text-blue-600 shadow-sm border border-slate-100/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory</span>
        </button>
      </div>

      {/* Tab Contents - Glassmorphic Container */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* TAB A: DEPARTMENTS */}
        {activeTab === "departments" && (
          <div className="p-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Departments List</h3>
                <p className="text-xs text-slate-500 font-medium">Manage hierarchical units within your organization.</p>
              </div>
              <button
                onClick={() => setShowDeptModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-white/60 rounded-2xl bg-white/40 shadow-sm custom-scrollbar">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 font-black uppercase tracking-wider text-[10px] border-b border-slate-100/50">
                    <th className="px-6 py-4">Department Name</th>
                    <th className="px-6 py-4">Department Head</th>
                    <th className="px-6 py-4">Parent Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/40">
                  {departments.map((dept) => {
                    const headName = employees.find((e) => e.id === dept.headId)?.name || "Unassigned";
                    const parentName = departments.find((d) => d.id === dept.parentDepartmentId)?.name || "None";
                    return (
                      <tr key={dept.id} className="hover:bg-white/80 hover:shadow-sm transition-all group">
                        <td className="px-6 py-4 font-bold text-slate-800">{dept.name}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{headName}</td>
                        <td className="px-6 py-4">
                          {dept.parentDepartmentId ? (
                            <span className="px-2.5 py-1 bg-slate-100/80 rounded-md text-slate-600 font-semibold text-xs border border-slate-200/50">
                              {parentName}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic font-medium">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                              dept.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-slate-100 text-slate-500 border border-slate-200/50"
                            }`}
                          >
                            {dept.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleDeptStatus(dept)}
                            title={dept.status === "Active" ? "Deactivate" : "Activate"}
                            className={`p-2 rounded-xl transition-all ${
                              dept.status === "Active" ? "hover:bg-rose-50 text-emerald-500 hover:text-rose-500" : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-500"
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB B: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="p-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Asset Categories & Schemas</h3>
                <p className="text-xs text-slate-500 font-medium">Define categories and custom data requirements.</p>
              </div>
              <button
                onClick={() => setShowCatModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
              >
                <Grid className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-6 border border-white/60 rounded-3xl bg-white/40 shadow-sm flex flex-col justify-between group hover:bg-white/80 hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 text-blue-600 transition-all shadow-sm">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-base">{cat.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Custom Schema Fields</p>
                      {cat.fields.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px] font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">No custom fields specified. Defaults apply.</p>
                      ) : (
                        <div className="space-y-2">
                          {cat.fields.map((f) => (
                            <div key={f.name} className="flex justify-between items-center bg-white border border-slate-100/80 p-2.5 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.01)] group-hover:border-blue-100/50 transition-colors">
                              <span className="font-bold text-slate-700 text-xs">{f.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                f.required ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                              }`}>
                                {f.type} {f.required ? "• Req" : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB C: EMPLOYEE DIRECTORY */}
        {activeTab === "employees" && (
          <div className="p-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Employees Directory</h3>
                <p className="text-xs text-slate-500 font-medium">Manage access credentials and system roles.</p>
              </div>
              <button
                onClick={() => setShowEmpModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-white/60 rounded-2xl bg-white/40 shadow-sm custom-scrollbar">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 font-black uppercase tracking-wider text-[10px] border-b border-slate-100/50">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Role / Access</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/40">
                  {employees.map((emp) => {
                    const deptName = departments.find((d) => d.id === emp.departmentId)?.name || "Unassigned";
                    return (
                      <tr key={emp.id} className="hover:bg-white/80 hover:shadow-sm transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xs border border-slate-200/60 shadow-sm">
                              {emp.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">{emp.email}</td>
                        <td className="px-6 py-4 text-slate-600 font-bold text-xs">{deptName}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                              emp.role === "Admin"
                                ? "bg-purple-50 text-purple-600 border border-purple-100/50"
                                : emp.role === "Asset Manager"
                                ? "bg-blue-50 text-blue-600 border border-blue-100/50"
                                : emp.role === "Department Head"
                                ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                                : "bg-slate-100 text-slate-600 border border-slate-200/50"
                            }`}
                          >
                            {emp.role === "Admin" && <Shield className="w-3 h-3" />}
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                              emp.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-slate-100 text-slate-500 border border-slate-200/50"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={emp.role}
                              onChange={(e) => handleRoleChange(emp.id, e.target.value as Role)}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <option value="Employee">Employee</option>
                              <option value="Department Head">Dept Head</option>
                              <option value="Asset Manager">Asset Manager</option>
                              <option value="Admin">Admin</option>
                            </select>
                            <button
                              onClick={() => toggleEmpStatus(emp)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${
                                emp.status === "Active" ? "bg-white hover:bg-rose-50 text-emerald-500 hover:text-rose-500 border border-slate-200" : "bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 border border-slate-200"
                              }`}
                              title={emp.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Modals - Premium Styling */}
      {/* ---------------------------------------------------- */}

      {/* Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                Add Department
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Department Head</label>
                  <select
                    value={deptForm.headId}
                    onChange={(e) => setDeptForm({ ...deptForm, headId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Parent Dept</label>
                  <select
                    value={deptForm.parentDepartmentId}
                    onChange={(e) => setDeptForm({ ...deptForm, parentDepartmentId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">None (Top Level)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Create Dept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Grid className="w-4 h-4" />
                </div>
                Add Asset Category
              </h3>
              <button onClick={() => setShowCatModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCatSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Equipments"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Custom Field Draft Block */}
              <div className="border border-slate-200 p-5 rounded-2xl space-y-4 bg-slate-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1.5 relative z-10">
                  <Layers className="w-3.5 h-3.5" /> Schema Builder
                </p>
                
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Warranty"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Data Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 transition-all"
                    >
                      <option value="text">Text String</option>
                      <option value="number">Numeric</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={newFieldReq}
                        onChange={(e) => setNewFieldReq(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">Required Field</span>
                  </label>
                  <button
                    type="button"
                    onClick={addFieldToDraft}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                  >
                    Add Field
                  </button>
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-200/60 relative z-10">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Draft Fields ({customFields.length})</p>
                    {customFields.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white p-2 border border-slate-100 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                        <span className="font-bold text-slate-700">{f.name} <span className="text-[9px] font-medium text-slate-400 uppercase ml-1">({f.type})</span></span>
                        <button
                          type="button"
                          onClick={() => removeFieldFromDraft(i)}
                          className="text-rose-500 hover:text-rose-700 p-1 bg-rose-50 hover:bg-rose-100 rounded text-[10px] font-bold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </div>
                Add Employee
              </h3>
              <button onClick={() => setShowEmpModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEmpSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@assetflow.com"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Department</label>
                  <select
                    value={empForm.departmentId}
                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">System Role</label>
                  <select
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value as Role })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Department Head">Dept Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
