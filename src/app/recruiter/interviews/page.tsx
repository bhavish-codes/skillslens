"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, FileText, ExternalLink, Copy, Check } from "lucide-react";

interface Interview {
  _id: string;
  title: string;
  role: string;
  type: string;
  linkToken: string;
  createdAt: string;
  questions: { id: string; text: string; skill: string }[];
}

export default function InterviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/interviews")
        .then(r => r.json())
        .then(d => setInterviews(d.interviews || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/dashboard" className="text-slate-400 hover:text-[#0F1F3D]">
              <span className="font-bold text-[#0F1F3D] text-xl">SkillsLens</span>
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-bold text-[#0F1F3D]">Interviews</h1>
          </div>
          <Link href="/recruiter/create-interview" className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Interview
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-8">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0F1F3D] mb-2">No interviews yet</h3>
            <p className="text-slate-500 mb-6">Create your first AI-powered interview to get started.</p>
            <Link href="/recruiter/create-interview" className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Interview
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <div key={interview._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#0F1F3D]">{interview.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${interview.type === 'video' ? 'bg-blue-50 text-[#2563EB] border-blue-200' : interview.type === 'chat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                        {interview.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-3">{interview.role} · {interview.questions?.length || 0} questions</p>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 max-w-md">
                      <span className="text-xs font-mono text-slate-500 truncate flex-1">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/interview/{interview.linkToken}
                      </span>
                      <button
                        onClick={() => copyLink(interview.linkToken)}
                        className="text-slate-400 hover:text-[#2563EB] transition-colors shrink-0"
                      >
                        {copiedToken === interview.linkToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 mb-2">{new Date(interview.createdAt).toLocaleDateString()}</div>
                    <Link
                      href={`/interview/${interview.linkToken}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm text-[#2563EB] font-semibold hover:underline"
                    >
                      Preview <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
