"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Clock, Star, TrendingUp, FileText, BarChart2, LogOut, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalInterviews: number;
  completionRate: number;
  avgScore: number;
  timeToFeedback: string;
  weeklyVolume: { name: string; interviews: number }[];
  trends: { interviews: string; completionRate: string; avgScore: string };
  recentCandidates: { sessionId: string; name: string; email: string; score: number; sentiment: string; completedAt: string }[];
}

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      alert(data.message + "\n" + JSON.stringify(data.credentials));
      fetchStats();
    } catch (err) {
      alert("Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-[#0F1F3D] text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight">SkillsLens</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white font-medium">
            <BarChart2 className="w-5 h-5 text-[#67E8F9]" /> Dashboard
          </Link>
          <Link href="/recruiter/candidates" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <Users className="w-5 h-5" /> Candidates
          </Link>
          <Link href="/recruiter/interviews" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
            <FileText className="w-5 h-5" /> Interviews
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button onClick={handleSeed} disabled={seeding} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin" : ""}`} /> {seeding ? "Seeding..." : "Load Demo Data"}
          </button>
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-sm">{session.user?.name?.charAt(0).toUpperCase()}</div>
            <div className="text-sm flex-1 min-w-0">
              <div className="font-medium text-white truncate">{session.user?.name}</div>
              <div className="text-slate-400 text-xs capitalize">{(session.user as any)?.role}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-slate-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="md:hidden flex items-center justify-between mb-6 bg-[#0F1F3D] text-white px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold tracking-tight">SkillsLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/recruiter/candidates" className="text-slate-300 hover:text-white text-xs font-medium">Candidates</Link>
            <Link href="/recruiter/interviews" className="text-slate-300 hover:text-white text-xs font-medium">Interviews</Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-slate-400 hover:text-white ml-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1F3D]">Overview</h1>
            <p className="text-slate-500 text-sm mt-0.5">Welcome back, {session.user?.name}. Here&apos;s what&apos;s happening.</p>
          </div>
          <Link href="/recruiter/create-interview" className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Interview</span><span className="sm:hidden">New</span>
          </Link>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Interviews", value: loading ? "—" : stats?.totalInterviews?.toString() ?? "0", icon: <Users className="w-5 h-5 text-[#2563EB]" />, trend: stats?.trends?.interviews ?? "0%" },
            { label: "Completion Rate", value: loading ? "—" : `${stats?.completionRate ?? 0}%`, icon: <Star className="w-5 h-5 text-[#2563EB]" />, trend: stats?.trends?.completionRate ?? "0%" },
            { label: "Avg. AI Score", value: loading ? "—" : `${stats?.avgScore ?? 0}/100`, icon: <TrendingUp className="w-5 h-5 text-[#2563EB]" />, trend: stats?.trends?.avgScore ?? "0%" },
            { label: "Time-to-Feedback", value: loading ? "—" : stats?.timeToFeedback ?? "~2m", icon: <Clock className="w-5 h-5 text-[#2563EB]" />, trend: "instant" },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">{kpi.icon}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  kpi.trend === "instant" || kpi.trend.startsWith("+")
                    ? "text-emerald-600 bg-emerald-50"
                    : kpi.trend === "0%"
                    ? "text-slate-500 bg-slate-100"
                    : "text-red-500 bg-red-50"
                }`}>{kpi.trend}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#0F1F3D] mb-1">{kpi.value}</div>
              <div className="text-xs md:text-sm font-medium text-slate-500">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0F1F3D]">Interview Volume (7 Days)</h2>
              <button onClick={fetchStats} className="text-slate-400 hover:text-[#2563EB] transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.weeklyVolume ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="interviews" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F1F3D]">Recent Candidates</h2>
              <Link href="/recruiter/candidates" className="text-[#2563EB] text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
              ) : !stats?.recentCandidates?.length ? (
                <div className="p-8 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No candidates yet.</p>
                  <p className="text-xs mt-1">Use &quot;Load Demo Data&quot; to populate.</p>
                </div>
              ) : (
                stats.recentCandidates.map((c) => (
                  <Link href={`/recruiter/candidate/${c.sessionId}/report`} key={c.sessionId}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center font-bold text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0F1F3D] text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.sentiment}</div>
                      </div>
                    </div>
                    <div className="font-bold text-[#0F1F3D]">
                      {c.score} <span className="text-slate-400 text-xs font-normal">/100</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden mt-6 text-center">
          <button onClick={handleSeed} disabled={seeding} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto">
            <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Loading demo data..." : "Load Demo Data"}
          </button>
        </div>
      </main>
    </div>
  );
}
