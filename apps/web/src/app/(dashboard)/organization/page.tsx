"use client";

import React, { useState } from "react";
import { useApp, Role, Department, AssetCategory, Employee } from "@/context/AppContext";
import { ShieldAlert, Users, Layers, Network, Plus, Shield, Award, Power, Edit3 } from "lucide-react";

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
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-fadeIn">
        <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-slate-800 text-lg">Access Denied</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Only users with the <strong className="text-slate-800">Admin</strong> role can view or modify Organization master setups. 
        </p>
        <p className="text-xs text-slate-400">
          Use the Simulator switcher at the top right to log in as an Admin (e.g. Abhinav Tyagi) to test this module.
        </p>
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Organization Setup</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your department structures, asset schemas, and employee credentials.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Network className="w-4.5 h-4.5" />
          <span>Departments</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          <span>Asset Categories</span>
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "employees"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Employee Directory</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        
        {/* TAB A: DEPARTMENTS */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Departments List</h3>
              <button
                onClick={() => setShowDeptModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Department Name</th>
                    <th className="p-3.5">Department Head</th>
                    <th className="p-3.5">Parent Department</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => {
                    const headName = employees.find((e) => e.id === dept.headId)?.name || "Unassigned";
                    const parentName = departments.find((d) => d.id === dept.parentDepartmentId)?.name || "None";
                    return (
                      <tr key={dept.id} className="hover:bg-slate-55/30 transition-colors">
                        <td className="p-3.5 font-bold text-slate-700">{dept.name}</td>
                        <td className="p-3.5 text-slate-500">{headName}</td>
                        <td className="p-3.5 text-slate-500">
                          {dept.parentDepartmentId ? (
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                              {parentName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              dept.status === "Active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {dept.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleDeptStatus(dept)}
                            title={dept.status === "Active" ? "Deactivate" : "Activate"}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Power className={`w-4 h-4 ${dept.status === "Active" ? "text-emerald-500" : "text-slate-300"}`} />
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Asset Categories & Metadata Schema</h3>
              <button
                onClick={() => setShowCatModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/30 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-200 pb-1.5">{cat.name}</h4>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custom Fields Configuration:</p>
                      {cat.fields.length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">No custom fields specified. Only default asset fields apply.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {cat.fields.map((f) => (
                            <div key={f.name} className="flex justify-between text-[11px] bg-white border border-slate-100 p-1.5 rounded-md shadow-2xs">
                              <span className="font-semibold text-slate-700">{f.name}</span>
                              <span className="text-slate-400 font-medium text-[9px] uppercase">
                                {f.type} {f.required ? "• Required" : ""}
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Employees Directory</h3>
              <button
                onClick={() => setShowEmpModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Promotions / Status Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const deptName = departments.find((d) => d.id === emp.departmentId)?.name || "Unassigned";
                    return (
                      <tr key={emp.id} className="hover:bg-slate-55/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] border border-slate-200">
                              {emp.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-700">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500">{emp.email}</td>
                        <td className="p-3.5 text-slate-500">{deptName}</td>
                        <td className="p-3.5 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              emp.role === "Admin"
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : emp.role === "Asset Manager"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : emp.role === "Department Head"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              emp.status === "Active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={emp.role}
                              onChange={(e) => handleRoleChange(emp.id, e.target.value as Role)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700"
                            >
                              <option value="Employee">Employee</option>
                              <option value="Department Head">Dept Head</option>
                              <option value="Asset Manager">Asset Manager</option>
                              <option value="Admin">Admin</option>
                            </select>
                            <button
                              onClick={() => toggleEmpStatus(emp)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                              title={emp.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              <Power className={`w-3.5 h-3.5 ${emp.status === "Active" ? "text-emerald-500" : "text-slate-300"}`} />
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
      {/* Modals */}
      {/* ---------------------------------------------------- */}

      {/* Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Add Department</h3>
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department Head</label>
                  <select
                    value={deptForm.headId}
                    onChange={(e) => setDeptForm({ ...deptForm, headId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Department</label>
                  <select
                    value={deptForm.parentDepartmentId}
                    onChange={(e) => setDeptForm({ ...deptForm, parentDepartmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">None (Top Level)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Add Asset Category</h3>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Equipments"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Custom Field Draft Block */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure Custom Field</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Warranty Months"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Data Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    >
                      <option value="text">Text / String</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="draftFieldReq"
                      checked={newFieldReq}
                      onChange={(e) => setNewFieldReq(e.target.checked)}
                      className="w-3.5 h-3.5 rounded"
                    />
                    <label htmlFor="draftFieldReq" className="text-[10px] font-bold text-slate-500 select-none">Required Field</label>
                  </div>
                  <button
                    type="button"
                    onClick={addFieldToDraft}
                    className="px-2.5 py-1 bg-slate-800 text-white rounded text-[10px] font-bold"
                  >
                    Add Field
                  </button>
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <p className="text-[9px] text-slate-400 font-semibold">Custom fields to be created:</p>
                    {customFields.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] bg-white p-1.5 border border-slate-100 rounded">
                        <span className="font-semibold text-slate-700">{f.name} ({f.type})</span>
                        <button
                          type="button"
                          onClick={() => removeFieldFromDraft(i)}
                          className="text-red-500 hover:text-red-700 font-bold"
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
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Add Employee</h3>
            <form onSubmit={handleEmpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@assetflow.com"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={empForm.departmentId}
                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Role</label>
                  <select
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Department Head">Dept Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
