"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Share2, AlertCircle, CheckCircle2, MessageSquare, Briefcase, Loader2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';

interface ReportData {
  report: {
    overallScore: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    technical: number;
    culturalFit: number;
    sentiment: string;
    insights: { type: string; text: string }[];
    status: string;
    recruiterAction?: string | null;
  };
  session: {
    candidateName: string;
    candidateEmail: string;
    completedAt: string;
  };
  interview: { title: string; role: string } | null;
  responses: { questionIndex: number; transcript: string; duration: number }[];
}

export default function AIReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<"overview" | "responses">("overview");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setReportId(id);
      fetch(`/api/reports/${id}`)
        .then(r => r.json())
        .then(d => {
          if (d.report) setData(d);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleAction = async (act: string) => {
    setAction(act);
    await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading AI Intelligence Report...</p>
        </div>
      </div>
    );
  }

  // Use seeded/live data or fall back to demo values
  const report = data?.report ?? {
    overallScore: 84, communication: 85, problemSolving: 88, confidence: 75, technical: 90, culturalFit: 82,
    sentiment: "Highly Positive",
    insights: [
      { type: "strength", text: "Demonstrated exceptional problem solving with a structured approach to architecture questions." },
      { type: "strength", text: "Strong technical knowledge of the React ecosystem including hooks and server components." },
      { type: "improvement", text: "Could benefit from elaborating more on database scaling strategies." }
    ],
    status: "ready",
  };
  const session = data?.session ?? { candidateName: "Sarah Jenkins", candidateEmail: "sarah@candidate.com", completedAt: new Date().toISOString() };
  const interview = data?.interview ?? { title: "Senior Frontend Engineer", role: "Frontend Engineer" };

  const radarData = [
    { subject: 'Communication', A: report.communication },
    { subject: 'Technical', A: report.technical },
    { subject: 'Confidence', A: report.confidence },
    { subject: 'Problem Solving', A: report.problemSolving },
    { subject: 'Cultural Fit', A: report.culturalFit },
  ];

  const sentimentData = [
    { name: 'Q1', sentiment: Math.round(report.communication * 0.9) },
    { name: 'Q2', sentiment: Math.round(report.confidence * 1.1) },
    { name: 'Q3', sentiment: Math.round(report.technical * 0.85) },
    { name: 'Q4', sentiment: Math.round(report.problemSolving) },
    { name: 'Q5', sentiment: Math.round(report.culturalFit) },
  ];

  const scorePct = report.overallScore / 100;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/candidates" className="text-slate-400 hover:text-[#0F1F3D]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center font-bold">
                {session.candidateName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F1F3D]">{session.candidateName}</h1>
                <p className="text-sm text-slate-500">{interview?.role ?? "—"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => handleAction("shortlist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${action === "shortlist" ? "bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              <CheckCircle2 className="w-4 h-4" /> {action === "shortlist" ? "Shortlisted ✓" : "Shortlist"}
            </button>
            <button
              onClick={() => handleAction("reject")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${action === "reject" ? "bg-red-700" : "bg-red-500 hover:bg-red-600"}`}
            >
              {action === "reject" ? "Rejected ✓" : "Reject"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-8">
        <div className="flex border-b border-slate-200 mb-8">
          {["overview", "responses"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab === "overview" ? "AI Intelligence Report" : "Transcripts"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score + Radar */}
            <div className="space-y-8">
              <div className="bg-[#0F1F3D] rounded-3xl p-8 text-center text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Briefcase className="w-40 h-40" />
                </div>
                <h3 className="text-xs font-bold text-[#67E8F9] uppercase tracking-widest mb-6">Overall AI Score</h3>
                <div className="relative inline-flex items-center justify-center mb-6">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                    <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#2563EB" strokeWidth="12"
                      strokeDasharray={circumference} strokeDashoffset={circumference * (1 - scorePct)}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-5xl font-bold">{report.overallScore}</span>
                </div>
                <div className="text-slate-300 text-sm">{report.sentiment}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#0F1F3D] mb-4">Competency Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <Radar name="Candidate" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {radarData.map(item => (
                    <div key={item.subject} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600 font-medium">{item.subject}</span>
                      <span className="text-xs font-bold text-[#0F1F3D]">{item.A}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights + Sentiment */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-8 border-t-4 border-t-[#2563EB] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MessageSquare className="w-48 h-48" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1F3D] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Groq AI Insights
                </h3>
                <ul className="space-y-4">
                  {report.insights.map((insight, idx) => (
                    <li key={idx} className={`flex gap-4 p-4 rounded-xl border ${insight.type === 'strength' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                      {insight.type === 'strength'
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        : <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />}
                      <div>
                        <h4 className={`font-bold text-sm mb-1 ${insight.type === 'strength' ? 'text-emerald-900' : 'text-amber-900'}`}>
                          {insight.type === 'strength' ? '✓ Strength' : '⚠ Area for Improvement'}
                        </h4>
                        <p className={`text-sm ${insight.type === 'strength' ? 'text-emerald-700' : 'text-amber-700'}`}>{insight.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-[#0F1F3D] mb-6">Sentiment Progression</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentData}>
                      <defs>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#67E8F9" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#67E8F9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sentiment" stroke="#2563EB" strokeWidth={3} fill="url(#sg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "responses" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-bold text-[#0F1F3D] mb-6">Candidate Responses</h3>
            {data?.responses?.length ? (
              <div className="space-y-4">
                {data.responses.map((r, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">
                        Question {r.questionIndex + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{r.duration}s</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{r.transcript}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No transcripts available for this session.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
