"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, Employee } from "@/context/AppContext";
import { Shield, ArrowRight, Sparkles, Mail, Lock, User, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, employees, addEmployee, resetPassword } = useApp();
  const [viewState, setViewState] = useState<
    "login" | "signup" | "forgot_email" | "forgot_otp" | "forgot_new_password"
  >("login");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Session validation - auto redirect if already logged in (simulated session)
  useEffect(() => {
    // If we have a user in context, and they came to the login page, redirect them.
    const storedUser = localStorage.getItem("af_user");
    if (storedUser) {
      // router.push("/dashboard"); 
    }
  }, [router]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (viewState === "login") {
      const user = employees.find((emp) => emp.email === email);
      if (!user) {
        setError("Account not found. Please check your email.");
      } else if (user.password !== password && user.password !== undefined) {
        setError("Invalid credentials. Please try again.");
      } else if (user.status !== "Active") {
        setError("Your account is currently inactive. Contact an Administrator.");
      } else {
        setCurrentUser(user);
        router.push("/dashboard");
      }
    } else if (viewState === "signup") {
      if (!name || !email || !password) {
        setError("Please fill out all fields.");
        setIsLoading(false);
        return;
      }
      const existingUser = employees.find((emp) => emp.email === email);
      if (existingUser) {
        setError("An account with this email already exists.");
      } else {
        const defaultDept = "dept-1"; 
        addEmployee({
          name,
          email,
          password,
          departmentId: defaultDept,
          role: "Employee",
          status: "Active",
        });
        
        const newUser = {
          id: `emp-${Date.now()}`,
          name,
          email,
          password,
          departmentId: defaultDept,
          role: "Employee" as const,
          status: "Active" as const,
        };
        setCurrentUser(newUser);
        router.push("/dashboard");
      }
    } else if (viewState === "forgot_email") {
      if (!email) {
        setError("Please enter your email address.");
      } else {
        const userExists = employees.find((emp) => emp.email === email);
        if (userExists) {
          try {
            // Call the backend to actually send the email via Nodemailer
            const res = await fetch("/api/auth/send-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, code: "741517" }),
            });
            const data = await res.json();
            
            if (data.success) {
              setSuccessMsg(`Reset code sent to your email! (Preview Link logged in terminal)`);
              if (data.previewUrl) {
                console.log("Ethereal Email Preview URL:", data.previewUrl);
              }
              setViewState("forgot_otp");
            } else {
              setError("Failed to send reset email. Please try again.");
            }
          } catch (err) {
            setError("Network error. Could not send email.");
          }
        } else {
          // Security best practice: don't reveal if account exists to prevent enumeration.
          // In a real app we'd still pretend to send, but we'll just skip the email call here.
          setSuccessMsg("If an account exists, a reset code was sent to your email.");
          setViewState("forgot_otp");
        }
      }
    } else if (viewState === "forgot_otp") {
      if (otp !== "741517") {
        setError("Invalid or expired reset code.");
      } else {
        setSuccessMsg("Code verified. Please set your new password.");
        setViewState("forgot_new_password");
      }
    } else if (viewState === "forgot_new_password") {
      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters long.");
      } else {
        const success = resetPassword(email, password);
        if (success) {
          setSuccessMsg("Password successfully reset! You can now log in.");
          setTimeout(() => {
            setViewState("login");
            setPassword("");
            setOtp("");
            setSuccessMsg("");
          }, 3000);
        } else {
          setError("An error occurred. Please restart the password reset process.");
        }
      }
    }
    
    setIsLoading(false);
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
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden relative transition-all duration-300">
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
                {viewState === "login" && "Welcome back"}
                {viewState === "signup" && "Create account"}
                {viewState === "forgot_email" && "Reset Password"}
                {viewState === "forgot_otp" && "Enter Reset Code"}
                {viewState === "forgot_new_password" && "Set New Password"}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {viewState === "login" && "Enter your details to access your workspace."}
                {viewState === "signup" && "Join as an Employee to get started."}
                {viewState === "forgot_email" && "Enter your email to receive a reset link."}
                {viewState === "forgot_otp" && "Enter the 6-digit code sent to your email."}
                {viewState === "forgot_new_password" && "Enter a strong new password."}
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 animate-pulse" />
                  <p className="text-sm text-red-200 font-medium leading-relaxed">{error}</p>
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
                  <p className="text-sm text-emerald-200 font-medium leading-relaxed">{successMsg}</p>
                </div>
              )}

              <div className="space-y-4">
                {viewState === "signup" && (
                  <div className="space-y-1.5 group animate-in fade-in slide-in-from-bottom-2">
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

                {(viewState === "login" || viewState === "signup" || viewState === "forgot_email") && (
                  <div className="space-y-1.5 group animate-in fade-in slide-in-from-bottom-2">
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
                )}
                
                {viewState === "forgot_otp" && (
                  <div className="space-y-1.5 group animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">6-Digit Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium tracking-widest"
                      />
                    </div>
                  </div>
                )}

                {(viewState === "login" || viewState === "signup" || viewState === "forgot_new_password") && (
                  <div className="space-y-1.5 group animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {viewState === "forgot_new_password" ? "New Password" : "Password"}
                      </label>
                      {viewState === "login" && (
                        <button
                          type="button"
                          onClick={() => setViewState("forgot_email")}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
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
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span>
                  {isLoading 
                    ? "Processing..." 
                    : viewState === "login" 
                      ? "Sign In" 
                      : viewState === "signup"
                        ? "Create Account"
                        : viewState === "forgot_email"
                          ? "Send Reset Code"
                          : viewState === "forgot_otp"
                            ? "Verify Code"
                            : "Reset Password"}
                </span>
                {!isLoading && !viewState.includes("forgot") && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                {!isLoading && viewState.includes("forgot") && <KeyRound className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              {viewState.includes("forgot") ? (
                <button
                  onClick={() => {
                    setViewState("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  Back to <span className="text-blue-400">Sign in</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setViewState(viewState === "login" ? "signup" : "login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium inline-flex items-center gap-1.5"
                >
                  {viewState === "login" ? (
                    <>No account yet? <span className="text-blue-400">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="text-blue-400">Sign in</span></>
                  )}
                </button>
              )}
            </div>

            {viewState === "login" && (
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
