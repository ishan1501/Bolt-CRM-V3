"use client";

import { useState, useEffect, useMemo } from "react";
import { Upload, ChevronDown, ChevronUp, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [user, setUser] = useState<Record<string, any>>({});
  
  // Accordion states
  const [openSchools, setOpenSchools] = useState(true);
  const [openPrograms, setOpenPrograms] = useState(true);
  const [openForms, setOpenForms] = useState(true);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      setUser(storedUser);
      setFormName(storedUser.name || storedUser.email || "User");
      setFormPhone(storedUser.phone || "9355349184");
    } catch (e) {
      console.error(e);
    }
  }, []);

  const userName = user?.name || user?.email || "User";
  const userRole = user?.role || "User";
  
  const userInitials = useMemo(() => {
    if (!userName || userName === "User") return "U";
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return userName.slice(0, 2).toUpperCase();
  }, [userName]);

  const handleUpdateProfile = () => {
    if (!formName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    // Update local storage representation
    const updatedUser = { ...user, name: formName, phone: formPhone };
    localStorage.setItem("bolt_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast.success("Profile updated successfully");
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Mock Data
  const programs = [
    "AI-First Operator #27", "Bloomberg Equity Research Program #27", "Capital Markets and Trading #27",
    "D2C brand bootcamp #27", "Executive Leadership Programme in AI & GCC Transformation #27",
    "Executive Presence and Public Speaking #27", "Executive Presence and Public Speaking US #27",
    "Global business programme IN #27", "Global business programme US #27", "London Immersion #27",
    "London Immersion US #27", "PGP BHARAT #27", "PGP BHARAT IN #27", "PGP EUROPE #27",
    "PGP EUROPE IN #27", "PGP in Capital Markets & Trading (IN) #27", "PGP in Capital Markets & Trading (US) #27",
    "PGP in Entrepreneurship & Business Acceleration #27", "PGP Rise: General Management #27",
    "PGP Rise: General Management (Global) #27", "PGP Rise: Owners & Promoters Management #27",
    "Strategic Business Management #27", "Strategic Business Management - Agentic AI, Product & Digital Innovation #27",
    "Strategic Business Management - Finance #27", "Strategic Business Management - Human Resources & Organisation Strategy #27",
    "Strategic Business Management - Marketing & Sales #27", "Strategic Business Management - Operations & Supply Chain Management #27"
  ];

  const forms = [
    "AI-First Operator #54", "Bloomberg Equity Research Program #72", "D2C brand bootcamp #79",
    "Executive Leadership Programme in AI & GCC Transformation #84", "Executive Presence and Public Speaking #62",
    "Executive Presence and Public Speaking US #87", "Four Nations Global Business Programme #56",
    "Four Nations Global Business Programme US #78", "London Immersion #59", "London Immersion US #93",
    "PGP BHARAT #53", "PGP BHARAT IN #69", "PGP : Capital Markets and Trading #96", "PGP EUROPE #51",
    "PGP EUROPE IN #60", "PGP in Capital Markets & Trading (IN) #61", "PGP in Capital Markets & Trading (US) #52",
    "PGP in Entrepreneurship and Business Acceleration #80", "PGP Rise: General Management #73",
    "PGP Rise: General Management (Global) #74", "PGP Rise: Owners & Promoters Management #76",
    "Strategic Business Management - Agentic AI, Product & Digital Innovation #90", "Strategic Business Management- Core #86",
    "Strategic Business Management - Finance #91", "Strategic Business Management - Human Resources & Organisation Strategy #89",
    "Strategic Business Management - Marketing & Sales #88", "Strategic Business Management - Operations & Supply Chain Management #92"
  ];

  return (
    <div className="w-full h-full flex flex-col relative pb-48 md:pb-32">
      <div className="px-6 md:px-10 py-6">
        <h1 className="text-xl font-bold text-[var(--bolt-text-primary)] mb-6 capitalize">Hi, {userName}</h1>
        
        <div className="w-full bg-[var(--bolt-bg-depth-2)] rounded-3xl border border-[var(--bolt-border-color)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-[rgba(249,200,81,0.03)] to-transparent pointer-events-none" />
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start relative z-10">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-40 h-40 rounded-[2rem] bg-gradient-to-tr from-[#1a1a1a] to-[#222] border-2 border-[var(--bolt-border-color)] flex items-center justify-center text-5xl font-bold text-[var(--bolt-accent)] shadow-[0_0_40px_rgba(249,200,81,0.05)]">
                {userInitials}
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-[var(--bolt-bg-depth-3)] hover:bg-white/5 border border-[var(--bolt-border-color)] transition-colors">
                <Upload size={16} />
                Update photo
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 w-full">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[var(--bolt-accent)] uppercase mb-2">Your Profile</span>
              <h2 className="text-3xl md:text-5xl font-black text-[var(--bolt-text-primary)] mb-2 capitalize break-words">{userName}</h2>
              <p className="text-sm md:text-lg text-[var(--bolt-text-secondary)] mb-4 break-all w-full">{user?.email || "No Email Provided"}</p>
              
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[var(--bolt-accent)]/30 bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] text-sm font-semibold capitalize mt-2">
                {userRole}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-[320px] shrink-0">
              <div className="bg-[var(--bolt-bg-depth-1)] rounded-2xl p-5 border border-[var(--bolt-border-color)] flex flex-col">
                <span className="text-3xl font-bold text-[var(--bolt-text-primary)] mb-1">1</span>
                <span className="text-xs font-bold tracking-widest text-[var(--bolt-text-secondary)] uppercase">Roles</span>
              </div>
              <div className="bg-[var(--bolt-bg-depth-1)] rounded-2xl p-5 border border-[var(--bolt-border-color)] flex flex-col">
                <span className="text-3xl font-bold text-[var(--bolt-text-primary)] mb-1">1</span>
                <span className="text-xs font-bold tracking-widest text-[var(--bolt-text-secondary)] uppercase">Schools</span>
              </div>
              <div className="bg-[var(--bolt-bg-depth-1)] rounded-2xl p-5 border border-[var(--bolt-border-color)] flex flex-col">
                <span className="text-3xl font-bold text-[var(--bolt-text-primary)] mb-1">27</span>
                <span className="text-xs font-bold tracking-widest text-[var(--bolt-text-secondary)] uppercase">Programs</span>
              </div>
              <div className="bg-[var(--bolt-bg-depth-1)] rounded-2xl p-5 border border-[var(--bolt-border-color)] flex flex-col">
                <span className="text-3xl font-bold text-[var(--bolt-text-primary)] mb-1">27</span>
                <span className="text-xs font-bold tracking-widest text-[var(--bolt-text-secondary)] uppercase">Forms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-8 mb-8">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "profile" 
                ? "bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] border border-[var(--bolt-accent)]/30" 
                : "bg-transparent text-[var(--bolt-text-secondary)] hover:bg-white/5 border border-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("password")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "password" 
                ? "bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] border border-[var(--bolt-accent)]/30" 
                : "bg-transparent text-[var(--bolt-text-secondary)] hover:bg-white/5 border border-[var(--bolt-border-color)]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Change Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-[var(--bolt-bg-depth-2)] rounded-3xl p-8 border border-[var(--bolt-border-color)] flex flex-col">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[var(--bolt-accent)] uppercase mb-1 block">Identity</span>
                    <h3 className="text-2xl font-bold text-[var(--bolt-text-primary)]">Personal information</h3>
                  </div>
                  <p className="text-sm text-[var(--bolt-text-secondary)] md:w-[220px] leading-relaxed">
                    Keep the visible account details fresh for communication and ownership records.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-wider text-[var(--bolt-text-secondary)] uppercase">Name</label>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="surface-input w-full px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-wider text-[var(--bolt-text-secondary)] uppercase">Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ""}
                      disabled
                      className="surface-input w-full px-4 py-3 rounded-xl text-sm font-medium transition-all opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-xs font-bold tracking-wider text-[var(--bolt-text-secondary)] uppercase">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="surface-input px-4 py-3 rounded-xl flex items-center justify-between w-32 shrink-0 cursor-pointer hover:border-[var(--bolt-accent)] transition-colors">
                      <span className="text-sm font-medium">+91 (IN)</span>
                      <ChevronDown size={14} className="text-[var(--bolt-text-secondary)]" />
                    </div>
                    <input 
                      type="text" 
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="surface-input w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-wider text-[var(--bolt-text-secondary)] uppercase">Roles Assigned</label>
                  <input 
                    type="text" 
                    defaultValue="Counsellor (sales) (L1)" 
                    readOnly
                    className="surface-input w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--bolt-text-tertiary)] bg-white/5 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-[var(--bolt-bg-depth-2)] rounded-3xl p-8 border border-[var(--bolt-border-color)] flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-[var(--bolt-accent)] uppercase mb-1 block">Access Scope</span>
                <h3 className="text-2xl font-bold text-[var(--bolt-text-primary)] mb-8">Assigned coverage</h3>

                <div className="border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] rounded-2xl mb-4 overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setOpenSchools(!openSchools)}
                  >
                    <span className="font-bold tracking-wider text-sm uppercase">Schools</span>
                    <div className="flex items-center gap-4">
                      <span className="bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] text-xs font-bold px-2 py-0.5 rounded-full">1</span>
                      {openSchools ? <ChevronUp size={16} className="text-[var(--bolt-accent)]" /> : <ChevronDown size={16} className="text-[var(--bolt-text-secondary)]" />}
                    </div>
                  </div>
                  {openSchools && (
                    <div className="px-5 pb-5 pt-0">
                      <span className="inline-block bg-[#1a1a1a] text-blue-400 border border-blue-500/30 text-sm px-3 py-1.5 rounded-lg font-medium">
                        Executive Education
                      </span>
                    </div>
                  )}
                </div>

                <div className="border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] rounded-2xl mb-4 overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setOpenPrograms(!openPrograms)}
                  >
                    <span className="font-bold tracking-wider text-sm uppercase">Programs</span>
                    <div className="flex items-center gap-4">
                      <span className="bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] text-xs font-bold px-2 py-0.5 rounded-full">27</span>
                      {openPrograms ? <ChevronUp size={16} className="text-[var(--bolt-accent)]" /> : <ChevronDown size={16} className="text-[var(--bolt-text-secondary)]" />}
                    </div>
                  </div>
                  {openPrograms && (
                    <div className="px-5 pb-5 pt-0 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {programs.map((program, idx) => (
                        <span key={idx} className="inline-block bg-[#1a1a1a] text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:border-emerald-400 transition-colors">
                          {program}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] rounded-2xl overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setOpenForms(!openForms)}
                  >
                    <span className="font-bold tracking-wider text-sm uppercase">Application Forms</span>
                    <div className="flex items-center gap-4">
                      <span className="bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] text-xs font-bold px-2 py-0.5 rounded-full">27</span>
                      {openForms ? <ChevronUp size={16} className="text-[var(--bolt-accent)]" /> : <ChevronDown size={16} className="text-[var(--bolt-text-secondary)]" />}
                    </div>
                  </div>
                  {openForms && (
                    <div className="px-5 pb-5 pt-0 flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {forms.map((form, idx) => (
                        <span key={idx} className="inline-block bg-[#1a1a1a] text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:border-indigo-400 transition-colors">
                          {form}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[var(--bolt-bg-depth-2)] rounded-3xl p-8 border border-[var(--bolt-border-color)] flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-[var(--bolt-accent)] uppercase mb-1 block">Reporting</span>
              <h3 className="text-2xl font-bold text-[var(--bolt-text-primary)] mb-8">Your reporting line</h3>
              
              <div className="border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] rounded-2xl mb-4 overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                  <span className="font-bold tracking-wider text-sm uppercase">Reports To</span>
                  <div className="flex items-center gap-4">
                    <span className="bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] text-xs font-bold px-2 py-0.5 rounded-full">1</span>
                    <ChevronUp size={16} className="text-[var(--bolt-accent)]" />
                  </div>
                </div>
                <div className="px-5 pb-5 pt-0">
                  <span className="inline-block bg-[#1a1a1a] text-blue-400 border border-blue-500/30 text-sm px-3 py-1.5 rounded-lg font-medium">
                    Arshiya Batool (arshiya.batool@mastersunion.org)
                  </span>
                </div>
              </div>

              <div className="border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                <span className="font-bold tracking-wider text-sm uppercase">Reports To You</span>
                <div className="flex items-center gap-4">
                  <span className="bg-white/5 text-[var(--bolt-text-secondary)] text-xs font-bold px-2 py-0.5 rounded-full">0</span>
                  <ChevronDown size={16} className="text-[var(--bolt-text-secondary)]" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[var(--bolt-bg-depth-2)] rounded-3xl p-8 border border-[var(--bolt-border-color)] flex flex-col max-w-3xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[var(--bolt-accent)] uppercase mb-1 block">Security</span>
                <h3 className="text-2xl font-bold text-[var(--bolt-text-primary)]">Change password</h3>
              </div>
              <p className="text-sm text-[var(--bolt-text-secondary)] md:w-[260px] leading-relaxed">
                Use a strong password with a mix of letters and numbers.
              </p>
            </div>

            <div className="flex flex-col gap-6 max-w-md">
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-semibold text-[var(--bolt-text-primary)]">Current Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter Current Password"
                    className="surface-input w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium transition-all"
                  />
                  <EyeOff size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bolt-text-secondary)] cursor-pointer hover:text-[var(--bolt-text-primary)]" />
                </div>
                <button className="absolute right-0 top-0 text-[11px] font-bold text-[var(--bolt-accent)] hover:underline mt-1">Forgot Password?</button>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-semibold text-[var(--bolt-text-primary)]">New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter New Password"
                    className="surface-input w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium transition-all"
                  />
                  <EyeOff size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bolt-text-secondary)] cursor-pointer hover:text-[var(--bolt-text-primary)]" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--bolt-text-primary)]">Confirm New Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="surface-input w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium transition-all"
                  />
                  <EyeOff size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bolt-text-secondary)] cursor-pointer hover:text-[var(--bolt-text-primary)]" />
                </div>
              </div>

              <div className="bg-[var(--bolt-bg-depth-1)] rounded-xl p-4 border border-[var(--bolt-border-color)] mt-2">
                <ul className="text-[11px] text-[var(--bolt-text-secondary)] space-y-2 flex flex-col font-medium">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shrink-0" /> Minimum 8 characters needed and Maximum 16 characters</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shrink-0" /> At least 1 number required</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shrink-0" /> Should contain at least 1 uppercase and 1 lowercase letter</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 md:bottom-6 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[800px] z-50 px-4 md:px-0 pointer-events-none">
        <div className="bg-[var(--bolt-bg-depth-3)]/90 backdrop-blur-md border border-[var(--bolt-border-color)] rounded-2xl shadow-2xl p-3 md:p-4 flex items-center justify-between pointer-events-auto">
          <button className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-[var(--bolt-border-color)] text-xs md:text-sm font-bold hover:bg-white/5 transition-colors shrink-0">
            {activeTab === "profile" ? "Back" : "Discard"}
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            {activeTab === "profile" && (
              <button 
                onClick={() => {
                  setFormName(user?.name || user?.email || "User");
                  setFormPhone(user?.phone || "9355349184");
                }}
                className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] hover:bg-white/5 transition-colors shrink-0"
              >
                Discard
              </button>
            )}
            <button 
              onClick={activeTab === "profile" ? handleUpdateProfile : handleUpdatePassword}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-[var(--bolt-accent)] text-black text-xs md:text-sm font-bold hover:bg-[#eab308] transition-colors shadow-[0_0_15px_rgba(249,200,81,0.2)] shrink-0"
            >
              {activeTab === "profile" ? "Update Profile" : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
