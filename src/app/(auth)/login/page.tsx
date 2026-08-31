"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { crmApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("bolt_auth_token")) {
      router.replace("/leads");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--bolt-accent)] animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const response = await crmApi.login(email, password);

      const token =
        response?.data?.token ||
        response?.token ||
        response?.data?.accessToken;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      localStorage.setItem("bolt_auth_token", token);
      const user = response?.data?.user || response?.user || response?.data || {};
      localStorage.setItem("bolt_user", JSON.stringify(user));

      toast.success("Welcome back!");
      window.location.href = "/leads";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#000000] text-white relative overflow-hidden font-sans">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Left Logo */}
      <div className="absolute top-8 left-10 flex items-center gap-3 z-20">
        <BrandLogo className="h-8 w-auto" />
      </div>

      {/* Left Content */}
      <div className="hidden lg:flex w-[55%] flex-col justify-center px-24 relative z-10">
        <h1 className="text-[52px] leading-[1.1] font-extrabold tracking-tight mb-4 text-white">
          Capture. Connect.<br />Convert.
        </h1>
        <p className="text-[#a1a1aa] text-xl font-medium tracking-wide">
          Revolutionizing Admissions & Enrollment
        </p>

        {/* Floating graphics could go here - we'll just use a subtle glow for now */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[var(--bolt-accent)] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      </div>

      {/* Right Content - Login Box */}
      <div className="w-full lg:w-[45%] flex items-center justify-center lg:justify-start p-6 z-10">
        <div className="w-full max-w-[440px] bg-[#111111] rounded-2xl p-10 border border-[#222] shadow-2xl relative">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Log in</h2>
            <p className="text-[#888] text-sm">Welcome to Bolt CRM Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                Email ID
              </label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="w-full bg-[#0a0a0a] border-none rounded-lg px-4 py-3.5 text-[15px] transition-all focus:ring-1 focus:ring-[var(--bolt-accent)] outline-none text-white placeholder:text-[#555]"
                placeholder="Enter Your Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#0a0a0a] border-none rounded-lg px-4 py-3.5 pr-10 text-[15px] transition-all focus:ring-1 focus:ring-[var(--bolt-accent)] outline-none text-white placeholder:text-[#555]"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] group-hover:text-[#aaa] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-[var(--bolt-accent)] hover:bg-[#eab308] text-black font-bold text-[15px] rounded-lg py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)] mt-8"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
