"use client";

import Link from "next/link";
import { ArrowRight, Zap, Users, ShieldCheck, CheckCircle2, ChevronRight, Activity, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("bolt_auth_token")) {
      router.replace("/leads");
    }
  }, [router]);

  if (!mounted) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen selection:bg-[#eab308]/30 selection:text-[#eab308]">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#eab308]/5 blur-[150px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <motion.section 
        className="w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32 flex flex-col items-center text-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#eab308] text-sm font-medium mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#eab308]"></span>
          </span>
          Bolt CRM v3 is Live
        </motion.div>
        
        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
          Capture. Connect.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#fde047]">Convert.</span>
        </motion.h1>
        
        <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed font-light">
          The all-in-one lead management and admissions tracking platform designed to help your team close deals faster and manage pipelines effortlessly.
        </motion.p>
        
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[#eab308] hover:bg-[#eab308]/90 text-black rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            Start Your Subscription <ArrowRight size={18} />
          </Link>
          <Link href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-center">
            View Pricing
          </Link>
        </motion.div>
      </motion.section>

      {/* Interactive Mockup Preview (CSS Only, no extra images) */}
      <motion.section 
        className="w-full max-w-5xl mx-auto px-6 mb-32 relative z-10 hidden md:block"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="h-10 bg-[#111] border-b border-white/10 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="p-8 grid grid-cols-3 gap-6 opacity-60">
            <div className="col-span-1 space-y-4">
              <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center px-6 gap-4">
                <Users className="text-[#eab308]" />
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center px-6 gap-4">
                <Calendar className="text-blue-400" />
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                  <div className="h-2 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-white/5 border border-white/5 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="h-6 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-[#eab308]/20 rounded-full w-24" />
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-white/5 rounded w-full" />
                <div className="h-12 bg-white/5 rounded w-full" />
                <div className="h-12 bg-white/5 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="w-full bg-[#050505] border-y border-white/10 py-32 px-6 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="text-center mb-20">
            <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-6">Everything you need to scale</motion.h2>
            <motion.p variants={fadeIn} className="text-white/50 max-w-xl mx-auto text-lg">Built for modern sales teams, Bolt CRM gives you the insights and automation you need to work smarter.</motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, color: "text-[#eab308]", bg: "bg-[#eab308]/10", title: "Lead Management", desc: "Track every interaction, note, and status change in a beautifully organized pipeline." },
              { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", title: "Instant Automations", desc: "Send perfectly timed WhatsApp messages and emails using customizable templates." },
              { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Bank-grade Security", desc: "Your data is secured with enterprise-level encryption and robust access controls." }
            ].map((feat, i) => (
              <motion.div key={i} variants={fadeIn} className="group bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:-translate-y-2 duration-300">
                <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                  <feat.icon size={28} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feat.title}</h3>
                <p className="text-white/40 leading-relaxed text-lg">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-6xl mx-auto py-32 px-6 flex flex-col items-center relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">One flat monthly fee for unlimited access to all features. No hidden charges.</p>
        </motion.div>

        <motion.div 
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl group hover:border-[#eab308]/30 transition-colors"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#eab308] to-[#fde047] group-hover:h-2 transition-all" />
          <div className="absolute -inset-24 bg-gradient-to-b from-[#eab308]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <h3 className="text-3xl font-bold mb-2">Pro Subscription</h3>
          <p className="text-white/50 mb-8 text-lg">Perfect for growing sales teams</p>
          
          <div className="flex items-end gap-2 mb-10 border-b border-white/10 pb-10">
            <span className="text-6xl font-extrabold tracking-tight">₹150</span>
            <span className="text-white/40 font-medium mb-2">/ month / user</span>
          </div>
          
          <ul className="space-y-5 mb-12">
            {[
              "Unlimited Lead Management",
              "Custom WhatsApp & Email Templates",
              "Advanced Analytics Dashboard",
              "Automated Task Reminders",
              "Priority Customer Support"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-4 text-white/70">
                <CheckCircle2 size={20} className="text-[#eab308] shrink-0" />
                <span className="text-lg">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Link href="/login" className="w-full block text-center py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            Subscribe Now
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-white/30 mt-6 font-medium">
            <ShieldCheck size={14} /> Secure payment powered by Razorpay
          </div>
        </motion.div>
      </section>

      {/* Footer Signature */}
      <footer className="w-full border-t border-white/5 py-12 text-center relative z-10 bg-black">
        <p className="text-white/40 text-sm font-medium tracking-wide">
          Made with ❤️ by Ishan
        </p>
      </footer>
    </div>
  );
}
