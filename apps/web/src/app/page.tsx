"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, Employee } from "@/context/AppContext";
import { api, setAuthToken } from "@/services/api";
import { Shield, Key, ArrowRight, UserPlus, Sparkles, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, employees } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isLogin) {
      try {
        const res = await api.login(email, password);
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    } else {
      if (!name || !email || !password) {
        setError("Please enter your name, email, and password.");
        setIsLoading(false);
        return;
      }
      try {
        await api.signup(name, email, password);
        const res = await api.login(email, password);
        setAuthToken(res.accessToken);
        setCurrentUser(res.user);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed. Email may already be registered.");
        setIsLoading(false);
      }
    }
  };

  const handleQuickLogin = (emp: Employee) => {
    setCurrentUser(emp);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Left Banner: Marketing/Promo Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center px-24 z-10">
        <div className="space-y-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/25">
              AF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AssetFlow</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl xl:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 leading-[1.1]">
              Elevate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Resource Management</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl font-light">
              Experience the next generation of asset lifecycle tracking, automated auditing, and intelligent resource allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            {[
              "Conflict-Free Allocation",
              "Smart Space Booking",
              "Predictive Maintenance",
              "Automated Audits"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 transition-colors group-hover:bg-blue-500/20 group-hover:border-blue-500/40">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Glass Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 z-10">
        <div className="w-full max-w-[440px] relative">
          
          {/* Glass Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            {/* Mobile Header */}
            <div className="flex items-center gap-2 lg:hidden mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/25">
                AF
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">AssetFlow</span>
            </div>

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {isLogin ? "Enter your details to access your workspace." : "Join your organization's workspace."}
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 animate-pulse" />
                  <p className="text-sm text-red-200 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@assetflow.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span>{isLoading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}</span>
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium inline-flex items-center gap-1.5"
              >
                {isLogin ? (
                  <>No account yet? <span className="text-blue-400">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-blue-400">Sign in</span></>
                )}
              </button>
            </div>

            {isLogin && (
              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Quick Demo Access</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {employees.slice(0, 4).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleQuickLogin(emp)}
                      className="p-4 text-left border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-2xl transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="font-bold text-white text-sm truncate">{emp.name}</p>
                      <p className="text-[11px] text-blue-300 font-semibold mt-1">{emp.role}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
