import { useState } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Mail, Lock, User, Loader2, KeyRound } from "lucide-react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ── Firebase client init ───────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "careerpilot-d81a9.firebaseapp.com",
  projectId: "careerpilot-d81a9",
  storageBucket: "careerpilot-d81a9.firebasestorage.app",
  messagingSenderId: "750418330030",
  appId: "1:750418330030:web:0329f80c8246ae118d083f",
};
if (!getApps().length) initializeApp(firebaseConfig);
const firebaseAuth = getAuth();
const googleProvider = new GoogleAuthProvider();

type View = "login" | "register" | "forgot" | "otp" | "reset";

export default function Auth({ setUser }: { setUser: (user: any) => void }) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => { setError(""); setSuccess(""); };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    const isLogin = view === "login";
    try {
      const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isLogin ? { email, password } : { email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    reset();
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      // Ignore user-closed popup (not a real error)
      if (err?.code === "auth/popup-closed-by-user") {
        return;
      }
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("A 6-digit code has been sent to your email.");
      setView("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password reset successfully! You can now sign in.");
      setOtp(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setSuccess(""); setView("login"); }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-500 text-sm";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/10">

        {/* Left image panel */}
        <div className="hidden md:flex w-1/2 relative flex-col justify-end p-8"
          style={{
            backgroundImage: "url('https://cdn.pixabay.com/photo/2015/01/08/18/29/entrepreneur-593358_1280.jpg')",
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full" />
              </div>
              <span className="font-bold text-lg text-white">CareerPilot AI</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Launch your career with AI</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Get AI-powered resume feedback, ATS scoring, and live mock interviews — all in one place.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 bg-[#0A0A0A] p-8 flex flex-col justify-center">

          {/* Back button */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <AnimatePresence mode="wait">

            {/* ── Login / Register ── */}
            {(view === "login" || view === "register") && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold mb-1 text-white">
                  {view === "login" ? "Welcome back" : "Create an account"}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {view === "login" ? "Sign in to access your dashboard" : "Start optimizing your career journey"}
                </p>

                {/* Google button */}
                <button onClick={handleGoogle} disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 mb-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white disabled:opacity-60">
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-50 rounded-xl" />
                  <form onSubmit={handleAuth} className="relative z-10 space-y-4">
                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

                    <AnimatePresence>
                      {view === "register" && (
                        <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                          <label className="text-sm font-medium text-slate-300">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="John Doe" required />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="name@example.com" required />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        {view === "login" && (
                          <button type="button" onClick={() => { reset(); setView("forgot"); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" required {...(view === "register" && { minLength: 8 })} />
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{view === "login" ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>

                  <div className="mt-5 text-center relative z-10">
                    <button type="button" onClick={() => { reset(); setView(view === "login" ? "register" : "login"); }}
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Forgot Password ── */}
            {view === "forgot" && (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button onClick={() => { reset(); setView("login"); }} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
                <h2 className="text-2xl font-bold mb-1 text-white">Forgot password?</h2>
                <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a 6-digit reset code.</p>
                <form onSubmit={handleForgot} className="space-y-4">
                  {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                  {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{success}</div>}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="name@example.com" required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── OTP + New Password ── */}
            {view === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button onClick={() => { reset(); setView("forgot"); }} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-1 text-white">Enter reset code</h2>
                <p className="text-slate-400 text-sm mb-6">We sent a 6-digit code to <span className="text-white">{email}</span>. Enter it below along with your new password.</p>
                <form onSubmit={handleReset} className="space-y-4">
                  {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                  {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{success}</div>}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">6-Digit Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className={inputCls} placeholder="123456" required maxLength={6} inputMode="numeric" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className={inputCls} placeholder="••••••••" required minLength={8} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className={inputCls} placeholder="••••••••" required minLength={8} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 transition-all">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Didn't receive the code?{" "}
                    <button type="button" onClick={() => { reset(); setView("forgot"); }} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Resend
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
