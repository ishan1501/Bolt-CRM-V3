import Link from "next/link";
import { ArrowRight, Zap, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#eab308] text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#eab308] animate-pulse" />
          Bolt CRM v3 is now Live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
          Capture. Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#fde047]">Convert.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
          The all-in-one lead management and admissions tracking platform designed to help your team close deals faster and manage pipelines effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[#eab308] hover:bg-[#eab308]/90 text-white rounded-full font-medium transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2">
            Start Your Subscription <ArrowRight size={18} />
          </Link>
          <Link href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium transition-all flex items-center justify-center">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-[#0a0a0a] border-y border-white/10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-white/50 max-w-xl mx-auto">Built for modern sales teams, Bolt CRM gives you the insights and automation you need to work smarter.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#eab308]/20 text-[#eab308] rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lead Management</h3>
              <p className="text-white/50 leading-relaxed">Track every interaction, note, and status change in a beautifully organized pipeline.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Automations</h3>
              <p className="text-white/50 leading-relaxed">Send perfectly timed WhatsApp messages and emails using customizable templates.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bank-grade Security</h3>
              <p className="text-white/50 leading-relaxed">Your data is secured with enterprise-level encryption and robust access controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - CRITICAL FOR RAZORPAY */}
      <section id="pricing" className="w-full max-w-6xl mx-auto py-24 px-6 flex flex-col items-center">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50 max-w-xl mx-auto">One flat monthly fee for unlimited access to all features. No hidden charges.</p>
        </div>

        <div className="w-full max-w-md bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#eab308] to-[#fde047]" />
          
          <h3 className="text-2xl font-bold mb-2">Pro Subscription</h3>
          <p className="text-white/60 mb-8">Perfect for growing sales teams</p>
          
          <div className="flex items-end gap-2 mb-8 border-b border-white/10 pb-8">
            <span className="text-5xl font-extrabold">₹150</span>
            <span className="text-white/50 font-medium mb-1">/ month / user</span>
          </div>
          
          <ul className="space-y-4 mb-10">
            {[
              "Unlimited Lead Management",
              "Custom WhatsApp & Email Templates",
              "Advanced Analytics Dashboard",
              "Automated Task Reminders",
              "Priority Customer Support"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 size={18} className="text-[#eab308] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link href="/login" className="w-full block text-center py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors">
            Subscribe Now
          </Link>
          <p className="text-center text-xs text-white/40 mt-4">Secure payment powered by Razorpay.</p>
        </div>
      </section>
    </div>
  );
}
