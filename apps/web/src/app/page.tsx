"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, Employee } from "@/context/AppContext";
import { api, setAuthToken } from "@/services/api";
import { Shield, Key, ArrowRight, UserPlus, Users, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, employees, addEmployee } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      try {
        const res = await api.login(email, password);
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Invalid credentials. Please try again.");
      }
    } else {
      if (!name || !email || !password) {
        setError("Please enter your name, email, and password.");
        return;
      }
      try {
        await api.signup(name, email, password);
        const res = await api.login(email, password);
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Signup failed. Email may already be registered.");
      }
    }
  };

  const handleQuickLogin = (emp: Employee) => {
    setCurrentUser(emp);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50">
      {/* Left Banner: Marketing/Promo Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-16 text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />

        <div className="max-w-md space-y-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">
              AF
            </div>
            <span className="text-2xl font-bold tracking-tight">AssetFlow</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Enterprise Resource & Asset Management
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track lifecycle, reserve rooms and equipment, request repairs, and run audit cycles in a single, secure centralized platform.
            </p>
          </div>

          {/* Interactive Feature List */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-slate-300">Automatic double-allocation prevention and conflict resolver.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-slate-300">Shared resource scheduler with time-slot overlap check.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-slate-300">Technician dispatch and workflow-linked maintenance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form / Profile Chooser */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                AF
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? "Sign in to AssetFlow" : "Create employee account"}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {isLogin ? "Enter your credentials or choose a quick login below." : "All registrations default to standard Employee permissions."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-lg font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="admin@assetflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{isLogin ? "Sign In" : "Sign Up"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Quick Access Simulator Profiles */}
          {isLogin && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Demo Quick Login Profiles</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {employees.slice(0, 4).map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleQuickLogin(emp)}
                    className="p-3 text-left border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl transition-all group"
                  >
                    <p className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{emp.role}</p>
                    <p className="text-[9px] text-slate-400 mt-1 truncate">{emp.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
