import Link from "next/link";
import { ArrowRight, CheckCircle2, Play, Users, BarChart, Clock, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-[#0F1F3D]">SkillsLens</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#0F1F3D]">Log in</Link>
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-[#0F1F3D] rounded-md hover:bg-slate-800 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#67E8F9]/20 via-slate-50 to-slate-50"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-blue-50 border border-blue-100 text-sm text-[#2563EB] font-medium">
          <span className="flex h-2 w-2 rounded-full bg-[#2563EB]"></span>
          Introducing AI-Powered Insights
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-[#0F1F3D] max-w-4xl mx-auto leading-tight mb-6">
          Hire smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#67E8F9]">AI interview intelligence</span>.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automate async video and chat interviews. Get instant, bias-free candidate intelligence reports and scale your hiring process.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0F1F3D] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Play className="w-4 h-4" /> Watch Demo
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="bg-[#0F1F3D] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-700">
          <div className="text-center px-4">
            <div className="text-4xl font-heading font-bold mb-2 text-[#67E8F9]">28k+</div>
            <div className="text-sm text-slate-400 font-medium">Active Users</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-heading font-bold mb-2 text-[#67E8F9]">79k+</div>
            <div className="text-sm text-slate-400 font-medium">Interviews Analyzed</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-heading font-bold mb-2 text-[#67E8F9]">4.9★</div>
            <div className="text-sm text-slate-400 font-medium">Average Rating</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-heading font-bold mb-2 text-[#67E8F9]">60%</div>
            <div className="text-sm text-slate-400 font-medium">Faster Time-to-Hire</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-[#0F1F3D] mb-4">Everything you need to hire top talent</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Our platform provides end-to-end intelligence for every stage of your interview pipeline.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="w-6 h-6 text-[#2563EB]" />,
              title: "Async Video & Chat",
              desc: "Let candidates interview on their own time with structured video and chat prompts."
            },
            {
              icon: <BarChart className="w-6 h-6 text-[#2563EB]" />,
              title: "AI Scoring Engine",
              desc: "Automatically grade responses across communication, technical, and cultural fit."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-[#2563EB]" />,
              title: "Bias-Free Rankings",
              desc: "Level the playing field with standardized evaluations and objective AI insights."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#0F1F3D] mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-[#0F1F3D] mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-xl font-bold text-[#0F1F3D] mb-2">Starter</h3>
              <div className="text-4xl font-heading font-bold mb-6">Free</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> 10 AI Interviews/mo</li>
                <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> Standard Support</li>
              </ul>
              <Link href="/login" className="block w-full py-3 px-4 bg-slate-100 text-[#0F1F3D] font-semibold text-center rounded-lg hover:bg-slate-200 transition-colors">Get Started</Link>
            </div>
            {/* Growth */}
            <div className="bg-[#0F1F3D] p-8 rounded-3xl border border-[#2563EB] shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2563EB] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-heading font-bold text-white">₹2,999</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#67E8F9]" /> Unlimited Interviews</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#67E8F9]" /> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-[#67E8F9]" /> Custom Branding</li>
              </ul>
              <Link href="/login" className="block w-full py-3 px-4 bg-[#2563EB] text-white font-semibold text-center rounded-lg hover:bg-blue-600 transition-colors">Start Free Trial</Link>
            </div>
            {/* Enterprise */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-xl font-bold text-[#0F1F3D] mb-2">Enterprise</h3>
              <div className="text-4xl font-heading font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-[#2563EB]" /> SSO & Custom Integrations</li>
              </ul>
              <button className="block w-full py-3 px-4 bg-slate-100 text-[#0F1F3D] font-semibold text-center rounded-lg hover:bg-slate-200 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-slate-500">
        <p>© 2026 SkillsLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
