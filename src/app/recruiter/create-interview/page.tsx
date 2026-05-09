"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function CreateInterview() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState<"video" | "chat" | "both">("video");
  const [questions, setQuestions] = useState([
    { id: "1", text: "Tell us about your background and experience.", skill: "Communication", timeLimit: 60 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), text: "", skill: "Technical", timeLimit: 60 }
    ]);
  };

  const updateQuestion = (id: string, field: string, value: string | number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, role, questions, type }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert("Error: " + (data.error || "Failed to create interview"));
        return;
      }
      const data = await res.json();
      const origin = typeof window !== "undefined" ? window.location.origin : "https://yourapp.vercel.app";
      setShareLink(`${origin}/interview/${data.linkToken}`);
    } catch (err) {
      alert("Network error. Make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (shareLink) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Interview Created!</h2>
          <p className="text-slate-500 mb-6">Your interview "{title}" is ready to be shared with candidates.</p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono break-all mb-6">
            {shareLink}
          </div>
          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-[#0F1F3D] hover:bg-slate-50" onClick={() => navigator.clipboard.writeText(shareLink)}>
              Copy Link
            </button>
            <Link href="/recruiter/dashboard" className="flex-1 py-3 bg-[#2563EB] rounded-lg text-sm font-semibold text-white hover:bg-blue-700 block text-center">
              Done
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/dashboard" className="text-slate-400 hover:text-[#0F1F3D]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-[#0F1F3D]">Create New Interview</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSubmitting || !title || !role}
            className="bg-[#2563EB] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Generate Link"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-8 space-y-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F1F3D] mb-4">Basic Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Interview Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer Q2" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role / Seniority</label>
              <input 
                type="text" 
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer - Senior" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Interview Type</label>
              <div className="flex gap-4">
                {['video', 'chat', 'both'].map((t) => (
                  <label key={t} className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${type === t ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="type" className="hidden" checked={type === t} onChange={() => setType(t as any)} />
                    <span className="capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0F1F3D]">Questions ({questions.length})</h2>
            <button onClick={addQuestion} className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
          
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-xl flex gap-4 bg-slate-50 group">
                <div className="font-bold text-slate-400 pt-2">{idx + 1}.</div>
                <div className="flex-1 space-y-4">
                  <input 
                    type="text"
                    value={q.text}
                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full bg-transparent border-b border-slate-300 focus:border-[#2563EB] outline-none py-2 text-[#0F1F3D] font-medium"
                  />
                  <div className="flex gap-4">
                    <select 
                      value={q.skill}
                      onChange={e => updateQuestion(q.id, 'skill', e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-600 outline-none"
                    >
                      <option value="Communication">Communication</option>
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Problem Solving">Problem Solving</option>
                    </select>
                    <select 
                      value={q.timeLimit}
                      onChange={e => updateQuestion(q.id, 'timeLimit', parseInt(e.target.value))}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-600 outline-none"
                    >
                      <option value={30}>30s limit</option>
                      <option value={60}>60s limit</option>
                      <option value={90}>90s limit</option>
                      <option value={120}>120s limit</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => removeQuestion(q.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
