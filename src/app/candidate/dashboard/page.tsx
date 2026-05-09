"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Video, LogOut, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F1F3D]">SkillsLens</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-sm text-white">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0F1F3D] mb-2">
            Welcome, {session.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500">
            You'll receive an interview link from a recruiter. Open it to start your async interview.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: <Video className="w-6 h-6 text-[#2563EB]" />,
              step: "1",
              title: "Receive Your Link",
              desc: "A recruiter will send you a unique interview link via email.",
            },
            {
              icon: <Clock className="w-6 h-6 text-[#2563EB]" />,
              step: "2",
              title: "Record Answers",
              desc: "Answer each question within the time limit at your own pace.",
            },
            {
              icon: <CheckCircle2 className="w-6 h-6 text-[#2563EB]" />,
              step: "3",
              title: "AI Analysis",
              desc: "Our AI scores your responses and sends insights to the recruiter.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-1">
                Step {item.step}
              </div>
              <h3 className="font-bold text-[#0F1F3D] mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#0F1F3D] rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Have an interview link?</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Paste your interview link in the browser address bar to begin.
          </p>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="https://skillslens.vercel.app/interview/..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm outline-none focus:border-[#67E8F9]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val.startsWith("http")) window.location.href = val;
                }
              }}
            />
            <button
              className="px-5 py-3 bg-[#2563EB] rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
              onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement);
                const val = input?.value?.trim();
                if (val?.startsWith("http")) window.location.href = val;
              }}
            >
              Go <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
