"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Shield,
  Calendar,
  Zap,
  Users,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { BrandLogo } from "@/components/ui/brand-logo";

// Extend Window to include the Razorpay constructor added by checkout.js
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const FEATURES = [
  { icon: Users, text: "Full leads & applications management" },
  { icon: Zap, text: "Pipeline overview & smart analytics" },
  { icon: Calendar, text: "Call scheduling & task planner" },
  { icon: Shield, text: "Saved leads, filters & bulk actions" },
];

export default function BillingPage() {
  const router = useRouter();

  const [status, setStatus] = useState<"active" | "pending" | "inactive" | "paused" | "expired">("inactive");
  const [utr, setUtr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // ── Read user from localStorage ────
  useEffect(() => {
    // Auth guard
    const token = localStorage.getItem("bolt_auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Extract user info
    try {
      const raw = localStorage.getItem("bolt_user");
      const user = raw ? JSON.parse(raw) : {};
      const email =
        user?.email || user?.admin_email || user?.username || user?.registered_email || "";
      const name = user?.name || user?.firstName || user?.first_name || "";
      setUserEmail(email);
      setUserName(name);

      if (email) {
        fetch(`/api/subscription/status?email=${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.status === "active" && data.daysLeft > 5) {
              router.push("/leads");
            } else if (data.status === "pending") {
              setStatus("pending");
            } else if (data.status === "paused") {
              setStatus("paused");
            } else if (data.status === "expired") {
              setStatus("expired");
            } else {
              setStatus("inactive");
            }
          })
          .catch(() => {
            setStatus("inactive");
          });
      }
    } catch {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleSubmitUtr = async () => {
    if (!utr || utr.length < 6) {
      setError("Please enter a valid UTR or Transaction ID");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscription/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, utr }),
      });

      if (!res.ok) throw new Error("Failed to submit UTR. Please try again.");

      setStatus("pending");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared page shell ─────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bolt-bg-depth-1)] text-[var(--bolt-text-primary)] relative overflow-hidden p-6">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Yellow ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#EAB308] rounded-full blur-[180px] opacity-[0.04] pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-8 left-10 flex items-center gap-3 z-20">
        <BrandLogo />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </div>
  );

  // ── Paused state ─────────────────────────────────────────────────────
  if (status === "paused") {
    return (
      <Shell>
        <div className="bg-[var(--bolt-bg-depth-2)] rounded-2xl p-10 border border-[var(--bolt-border-color)] shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[var(--bolt-text-primary)]">Access Paused</h2>
          <p className="text-[#888] text-sm mb-7">
            Your access to Bolt CRM has been temporarily paused by an administrator. Please contact your admin for more information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-[var(--bolt-accent)] hover:underline text-sm font-medium"
          >
            Refresh Status
          </button>
        </div>
      </Shell>
    );
  }

  // ── Pending state ─────────────────────────────────────────────────────
  if (status === "pending") {
    return (
      <Shell>
        <div className="bg-[var(--bolt-bg-depth-2)] rounded-2xl p-10 border border-[var(--bolt-border-color)] shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-[#888] text-sm mb-7">
            Your UTR has been submitted. An admin is currently reviewing your payment. You will get access to the CRM once approved.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#EAB308] hover:underline text-sm font-medium"
          >
            Refresh Status
          </button>
        </div>
      </Shell>
    );
  }

  // ── Payment wall ──────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="bg-[var(--bolt-bg-depth-2)] rounded-2xl border border-[var(--bolt-border-color)] shadow-2xl overflow-hidden">
        {status === "expired" && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold text-sm">Your plan has expired</h3>
              <p className="text-red-400/80 text-xs mt-1">Please submit a new payment to restore your CRM access.</p>
            </div>
          </div>
        )}
        {/* Header band */}
        <div className="px-10 pt-10 pb-8 border-b border-[#1a1a1a]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
            <span className="text-[#EAB308] text-[11px] font-bold uppercase tracking-widest">
              Monthly Plan
            </span>
          </div>

          <div className="flex items-end gap-1">
            <span className="text-5xl font-extrabold tracking-tight">₹150</span>
            <span className="text-[#555] text-xl mb-1.5 ml-0.5">/month</span>
          </div>
          <p className="text-[#666] text-sm mt-1.5">
            Full access to Bolt CRM for the entire month.
          </p>
        </div>

        {/* Manual Payment Section */}
        <div className="px-10 py-7 border-b border-[#1a1a1a]">
          <h3 className="font-semibold text-[var(--bolt-text-primary)] mb-4 text-center">Scan & Pay via any UPI app</h3>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 rounded-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("upi://pay?pa=8279988591@ptyes&pn=Bolt CRM&am=150.00&cu=INR")}`} 
                alt="UPI QR Code" 
                className="w-32 h-32"
              />
            </div>
          </div>
          <div className="text-center text-sm font-medium text-[#EAB308] tracking-widest mb-1">
            8279988591@ptyes
          </div>
        </div>

        {/* CTA */}
        <div className="px-10 py-8">
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-4">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">
                Enter UTR / Transaction ID
              </label>
              <input 
                type="text" 
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 312345678901"
                className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[#EAB308] transition-colors"
              />
            </div>

            <button
              onClick={handleSubmitUtr}
              disabled={isLoading || !utr}
              className="w-full bg-[#EAB308] hover:bg-[#ca9e00] text-black font-bold text-[15px] rounded-xl py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.12)]"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Submit Payment Details →"}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

