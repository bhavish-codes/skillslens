"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Download, Mail, BarChart2, Users, FileText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface Candidate {
  sessionId: string;
  candidateName: string;
  candidateEmail: string;
  interviewTitle: string;
  role: string;
  completedAt: string;
  report: { overallScore: number; sentiment: string; status: string; reportId: string } | null;
}

const STAGE_MAP: Record<string, string> = {
  "Highly Positive": "Shortlisted",
  "Positive": "Interviewed",
  "Neutral": "Interviewed",
};

export default function CandidatePipeline() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/reports")
        .then(r => r.json())
        .then(d => setCandidates(d.candidates || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const filtered = candidates.filter(c =>
    c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F1F3D] text-white flex-col shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center font-bold">S</div>
          <span className="font-bold text-xl tracking-tight">SkillsLens</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <BarChart2 className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/recruiter/candidates" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white font-medium">
            <Users className="w-5 h-5 text-[#67E8F9]" /> Candidates
          </Link>
          <Link href="/recruiter/interviews" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> Interviews
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-sm">{session.user?.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm truncate">{session.user?.name}</div>
              <div className="text-slate-400 text-xs">Recruiter</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-slate-500 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col pb-20">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-[#0F1F3D]">Candidates Pipeline</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2563EB] outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const csv = [
                    ["Name", "Email", "Role", "Score", "Sentiment", "Completed"].join(","),
                    ...filtered.map(c => [c.candidateName, c.candidateEmail, c.role, c.report?.overallScore ?? "N/A", c.report?.sentiment ?? "N/A", c.completedAt].join(","))
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = "candidates.csv"; a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400">Loading candidates...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{searchTerm ? "No matches found." : "No completed interviews yet. Use 'Load Demo Data' on the dashboard."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">Candidate</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Stage</th>
                      <th className="p-4 font-semibold">AI Score</th>
                      <th className="p-4 font-semibold">Sentiment</th>
                      <th className="p-4 font-semibold">Completed</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(candidate => {
                      const stage = STAGE_MAP[candidate.report?.sentiment ?? ""] ?? "Applied";
                      return (
                        <tr key={candidate.sessionId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {candidate.candidateName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-[#0F1F3D] text-sm">{candidate.candidateName}</div>
                                <div className="text-xs text-slate-500">{candidate.candidateEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 text-sm">{candidate.role || "—"}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              stage === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              stage === 'Interviewed' ? 'bg-blue-50 text-[#2563EB] border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>{stage}</span>
                          </td>
                          <td className="p-4">
                            {candidate.report ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0F1F3D]">{candidate.report.overallScore}</span>
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${candidate.report.overallScore}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm italic">Pending</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-medium ${
                              candidate.report?.sentiment === 'Highly Positive' ? 'text-emerald-600' :
                              candidate.report?.sentiment === 'Positive' ? 'text-blue-600' : 'text-slate-500'
                            }`}>{candidate.report?.sentiment ?? "—"}</span>
                          </td>
                          <td className="p-4 text-slate-500 text-sm">
                            {candidate.completedAt ? new Date(candidate.completedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {candidate.report && (
                                <Link href={`/recruiter/candidate/${candidate.sessionId}/report`} className="text-sm text-[#2563EB] font-semibold hover:underline whitespace-nowrap">
                                  View Report
                                </Link>
                              )}
                              <a href={`mailto:${candidate.candidateEmail}`} className="p-1.5 text-slate-400 hover:text-[#0F1F3D] rounded-lg hover:bg-slate-100 transition-colors">
                                <Mail className="w-4 h-4" />
                              </a>
                            </div>
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
      </main>
    </div>
  );
}
