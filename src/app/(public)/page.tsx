"use client";

import Link from "next/link";
import { ArrowRight, Zap, Users, ShieldCheck, CheckCircle2, ChevronRight, Activity, Calendar, MessageSquare, BarChart3, Target, PhoneCall, Play, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("bolt_auth_token")) {
      router.replace("/leads");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  if (!mounted) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--bolt-bg-depth-1)] text-[var(--bolt-text-primary)] selection:bg-[#eab308]/30 selection:text-[#eab308] overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex justify-center">
        <div className="absolute -top-[20%] w-[1000px] h-[600px] rounded-[100%] bg-[#eab308]/10 blur-[120px] opacity-50" />
        <div className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] opacity-40" />
        <div className="absolute bottom-[-10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[150px] opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>



      {/* Hero Section */}
      <motion.section 
        className="w-full max-w-6xl mx-auto px-6 min-h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeIn} className="mb-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <BrandLogo iconOnly className="scale-[2]" />
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] text-[#eab308] text-xs md:text-sm font-medium mb-8 backdrop-blur-md hover:bg-[var(--bolt-border-color)] transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#eab308]"></span>
          </span>
          Introducing Bolt CRM v3.0
        </motion.div>
        
        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[var(--bolt-text-primary)] mb-8 leading-[1.05] max-w-4xl mx-auto">
          Scale your sales pipeline with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] via-yellow-400 to-[#eab308] animate-gradient-x bg-[length:200%_auto]">intelligent clarity.</span>
        </motion.h1>
        
        <motion.p variants={fadeIn} className="text-lg md:text-xl text-[var(--bolt-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          The ultimate lead management platform for modern teams. Track interactions, automate follow-ups, and close deals faster than ever before.
        </motion.p>
        
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[#eab308] hover:bg-[#eab308]/90 text-black rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            Get Started Now <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.section>

      {/* Hero Image / Dashboard Mockup */}
      <motion.section 
        className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-32 relative z-10 perspective-1000"
        initial={{ opacity: 0, y: 100, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl md:rounded-[2rem] border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)]/80 backdrop-blur-2xl shadow-2xl shadow-[#eab308]/10 overflow-hidden flex flex-col relative group">
          {/* Mockup Header */}
          <div className="h-12 bg-[var(--bolt-bg-depth-1)]/50 border-b border-[var(--bolt-border-color)] flex items-center px-4 md:px-6 gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 max-w-md mx-4 h-6 bg-[var(--bolt-bg-depth-3)] rounded-md flex items-center px-3 hidden md:flex">
              <Search size={12} className="text-[var(--bolt-text-tertiary)] mr-2" />
              <div className="h-2 w-24 bg-[var(--bolt-border-color)] rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--bolt-border-color)]" />
              <div className="w-6 h-6 rounded-full bg-[#eab308]/20 border border-[#eab308]/30 flex items-center justify-center">
                <span className="text-[10px] text-[#eab308]">JD</span>
              </div>
            </div>
          </div>
          {/* Mockup Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 md:w-56 border-r border-[var(--bolt-border-color)] p-4 hidden sm:flex flex-col gap-4 bg-[var(--bolt-bg-depth-1)]/20">
              <div className="h-8 w-full bg-[#eab308]/10 border border-[#eab308]/20 rounded-lg" />
              <div className="h-8 w-full bg-[var(--bolt-bg-depth-3)] rounded-lg" />
              <div className="h-8 w-full bg-[var(--bolt-bg-depth-3)] rounded-lg" />
              <div className="h-8 w-full bg-[var(--bolt-bg-depth-3)] rounded-lg" />
            </div>
            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-1/3">
                  <div className="h-6 w-32 bg-[var(--bolt-bg-depth-4)] rounded-md" />
                  <div className="h-3 w-48 bg-[var(--bolt-border-color)] rounded-md" />
                </div>
                <div className="h-10 w-28 bg-[#eab308] rounded-lg hidden sm:block" />
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--bolt-bg-depth-3)] rounded-bl-full" />
                    <div className="h-3 w-16 bg-[var(--bolt-bg-depth-4)] rounded" />
                    <div className="h-8 w-24 bg-[var(--bolt-border-color)] rounded mt-2" />
                  </div>
                ))}
              </div>

              {/* Table Mockup */}
              <div className="flex-1 bg-[var(--bolt-bg-depth-1)]/40 border border-[var(--bolt-border-color)] rounded-xl overflow-hidden flex flex-col">
                <div className="h-10 border-b border-[var(--bolt-border-color)] flex items-center px-4 gap-4 bg-[var(--bolt-bg-depth-3)]">
                  <div className="h-3 w-32 bg-[var(--bolt-bg-depth-4)] rounded" />
                  <div className="h-3 w-24 bg-[var(--bolt-bg-depth-4)] rounded hidden sm:block" />
                  <div className="h-3 w-24 bg-[var(--bolt-bg-depth-4)] rounded hidden md:block" />
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 border-b border-[var(--bolt-border-color)] flex items-center px-4 gap-4 hover:bg-[var(--bolt-bg-depth-3)] transition-colors">
                    <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-full max-w-[100px] bg-[var(--bolt-bg-depth-4)] rounded" />
                        <div className="h-2 w-full max-w-[80px] bg-[var(--bolt-border-color)] rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full hidden sm:block" />
                    <div className="h-3 w-24 bg-[var(--bolt-border-color)] rounded hidden md:block ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bolt-bg-depth-1)] via-transparent to-transparent opacity-50 pointer-events-none" />
        </div>
      </motion.section>

      {/* Marquee Section */}
      <section className="w-full py-10 border-y border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)] relative z-10 overflow-hidden flex flex-col items-center justify-center">
        <p className="text-[var(--bolt-text-secondary)] text-sm font-medium mb-8 text-center px-4">TRUSTED BY INNOVATIVE SALES TEAMS WORLDWIDE</p>
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
            {[1, 2].map(set => (
              <div key={set} className="flex items-center gap-16 md:gap-32 px-8">
                <span className="text-xl md:text-2xl font-bold text-[var(--bolt-text-tertiary)] tracking-widest flex items-center gap-2"><Zap size={24}/> ACME CORP</span>
                <span className="text-xl md:text-2xl font-bold text-[var(--bolt-text-tertiary)] tracking-widest flex items-center gap-2"><Target size={24}/> GLOBEX</span>
                <span className="text-xl md:text-2xl font-bold text-[var(--bolt-text-tertiary)] tracking-widest flex items-center gap-2"><Activity size={24}/> SOYLENT</span>
                <span className="text-xl md:text-2xl font-bold text-[var(--bolt-text-tertiary)] tracking-widest flex items-center gap-2"><ShieldCheck size={24}/> INITECH</span>
                <span className="text-xl md:text-2xl font-bold text-[var(--bolt-text-tertiary)] tracking-widest flex items-center gap-2"><PhoneCall size={24}/> UMBRELLA</span>
              </div>
            ))}
          </ul>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="w-full max-w-6xl mx-auto py-32 px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--bolt-text-primary)] tracking-tight">Everything you need to close.</h2>
          <p className="text-[var(--bolt-text-secondary)] max-w-xl mx-auto text-lg">Bolt replaces your messy spreadsheets and bloated enterprise tools with a lightning-fast, beautifully designed workspace.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:auto-rows-[300px]">
          {/* Feature 1: Large Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-2 bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] rounded-3xl p-8 relative overflow-hidden group hover:border-[var(--bolt-border-color)] transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#eab308]/10 blur-[80px] rounded-full group-hover:bg-[#eab308]/20 transition-colors" />
            <div className="w-12 h-12 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] flex items-center justify-center mb-6">
              <Users size={24} className="text-[#eab308]" />
            </div>
            <h3 className="text-2xl font-semibold text-[var(--bolt-text-primary)] mb-3">Intelligent Lead Management</h3>
            <p className="text-[var(--bolt-text-secondary)] text-lg max-w-md">Instantly see where every prospect stands. Track emails, calls, notes, and lifecycle stages in one unified timeline.</p>
            
            {/* Mini visual */}
            <div className="absolute bottom-0 right-8 transform translate-y-1/4 translate-x-1/4 w-72 h-48 bg-[var(--bolt-bg-depth-1)]/50 border border-[var(--bolt-border-color)] rounded-tl-2xl p-4 hidden sm:block">
              <div className="space-y-3 opacity-60">
                <div className="h-6 w-1/2 bg-[#eab308]/20 rounded-md" />
                <div className="h-16 w-full bg-[var(--bolt-bg-depth-3)] rounded-md" />
                <div className="h-16 w-full bg-[var(--bolt-bg-depth-3)] rounded-md" />
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] rounded-3xl p-8 relative overflow-hidden group hover:border-[var(--bolt-border-color)] transition-colors"
          >
            <div className="w-12 h-12 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] flex items-center justify-center mb-6">
              <Zap size={24} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-[var(--bolt-text-primary)] mb-3">Power Shots</h3>
            <p className="text-[var(--bolt-text-secondary)] text-lg">Automated pacing alerts and daily power shot reminders to keep your calling velocity at maximum.</p>
          </motion.div>

          {/* Feature 3: Small Square */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] rounded-3xl p-8 relative overflow-hidden group hover:border-[var(--bolt-border-color)] transition-colors"
          >
            <div className="w-12 h-12 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] flex items-center justify-center mb-6">
              <MessageSquare size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-semibold text-[var(--bolt-text-primary)] mb-3">1-Click Comms</h3>
            <p className="text-[var(--bolt-text-secondary)] text-lg">Launch WhatsApp Web or Email clients instantly from any lead profile.</p>
          </motion.div>

          {/* Feature 4: Large Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] rounded-3xl p-8 relative overflow-hidden group hover:border-[var(--bolt-border-color)] transition-colors flex flex-col justify-end"
          >
             <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
             <div className="relative z-10">
              <div className="w-12 h-12 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-[var(--bolt-text-primary)]" />
              </div>
              <h3 className="text-2xl font-semibold text-[var(--bolt-text-primary)] mb-3">Admin Analytics Engine</h3>
              <p className="text-[var(--bolt-text-secondary)] text-lg max-w-md">Real-time charts, daily pacing metrics, and automated historical roll-ups. Make data-driven decisions without leaving the app.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-5xl mx-auto py-24 px-6 relative z-10">
        <motion.div 
          className="bg-gradient-to-b from-[var(--bolt-bg-depth-2)] to-[var(--bolt-bg-depth-1)] border border-[var(--bolt-border-color)] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute -top-[50%] -right-[20%] w-[600px] h-[600px] bg-[#eab308]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--bolt-text-primary)] tracking-tight">Simple pricing.<br/>Unlimited potential.</h2>
            <p className="text-[var(--bolt-text-secondary)] text-lg max-w-md mx-auto md:mx-0">Get full access to all CRM features, analytics, and integrations for one flat monthly rate. No hidden fees.</p>
            <ul className="space-y-4 pt-4 text-left inline-block md:block mx-auto">
              {["Unlimited Contacts", "Advanced Search & Filters", "Call Analytics", "Priority Support"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-[var(--bolt-text-secondary)]">
                  <CheckCircle2 size={20} className="text-[#eab308]" /> {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:w-[380px] bg-[var(--bolt-bg-depth-1)] border border-[var(--bolt-border-color)] rounded-3xl p-8 relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--bolt-text-primary)]">Pro Plan</h3>
              <span className="px-3 py-1 bg-[#eab308]/10 text-[#eab308] text-xs font-bold rounded-full">MOST POPULAR</span>
            </div>
            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-bold text-[var(--bolt-text-primary)]">₹150</span>
              <span className="text-[var(--bolt-text-secondary)] pb-1">/mo per user</span>
            </div>
            <Link href="/login" className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--bolt-text-primary)] text-[var(--bolt-bg-depth-1)] hover:opacity-80 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              Get Started <ArrowRight size={18} />
            </Link>
            <p className="text-center text-xs text-[var(--bolt-text-secondary)] mt-4">Secure payment via Razorpay</p>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full py-32 px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto flex flex-col items-center gap-8"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[var(--bolt-text-primary)] tracking-tight">Ready to close more deals?</h2>
          <p className="text-xl text-[var(--bolt-text-secondary)]">Join thousands of high-performing sales professionals using Bolt today.</p>
          <Link href="/login" className="px-10 py-5 bg-[#eab308] hover:bg-[#eab308]/90 text-black rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95">
            Create Your Account
          </Link>
        </motion.div>
      </section>


    </div>
  );
}
