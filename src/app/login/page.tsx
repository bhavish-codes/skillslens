"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"recruiter" | "candidate">("recruiter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      role,
      name: name || email.split("@")[0],
      action: isLogin ? "login" : "signup",
      redirect: false,
    });

    if (res?.error) {
      setError(res.error === "CredentialsSignin" 
        ? "Invalid credentials. Please try again." 
        : res.error);
      setLoading(false);
    } else {
      // Fetch the session to get the role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const userRole = (session?.user as any)?.role;
      router.push(userRole === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-[#0F1F3D]">SkillsLens</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-center text-[#0F1F3D] mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-center text-slate-500 mb-8">
            {isLogin ? "Sign in to your account to continue" : "Start your AI-powered hiring journey"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "recruiter" ? "bg-white text-[#0F1F3D] shadow-sm" : "text-slate-500 hover:text-[#0F1F3D]"}`}
                  >
                    Recruiter
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("candidate")}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "candidate" ? "bg-white text-[#0F1F3D] shadow-sm" : "text-slate-500 hover:text-[#0F1F3D]"}`}
                  >
                    Candidate
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-700 font-medium">Demo: <span className="font-mono">demo@recruiter.com</span> / <span className="font-mono">password123</span></p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
