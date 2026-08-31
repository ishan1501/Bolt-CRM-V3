"use client";

import { useState } from "react";
import { Calculator, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COURSES = [
  { category: "Executive",       name: "PGP Rise: General Management",                          duration: "12 months", appFee: 500,   admFee: 50000, tuitionFee: 2750000 },
  { category: "Executive",       name: "PGP in Capital Markets & Trading",                        duration: "12 months", appFee: 500,   admFee: 50000, tuitionFee: 2050000 },
  { category: "Executive",       name: "PGP in Entrepreneurship & Business Acceleration (BAP)",   duration: "9 months",  appFee: 500,   admFee: 50000, tuitionFee: 1750000 },
  { category: "Executive",       name: "PGP Rise: General Management (Global)",                   duration: "12 months", appFee: 500,   admFee: 50000, tuitionFee: 4372650 },
  { category: "Executive",       name: "Bloomberg Equity Research Programme",                     duration: "N/A",       appFee: 500,   admFee: 50000, tuitionFee: 1750000 },
  { category: "Executive",       name: "Executive Leadership in AI & GCC Transformation",         duration: "N/A",       appFee: 500,   admFee: 50000, tuitionFee: 1750000 },
  { category: "Family Business", name: "PGP Rise: Owners & Promoters Management (OPM)",           duration: "12 months", appFee: 5000,  admFee: 75000, tuitionFee: 4425000 },
  { category: "Family Business", name: "PGP in Entrepreneurship & Business Acceleration (BAP)",   duration: "9 months",  appFee: 500,   admFee: 50000, tuitionFee: 1750000 },
  { category: "Immersions",      name: "PGP Bharat",                                              duration: "6 months",  appFee: 500,   admFee: 50000, tuitionFee: 2050000 },
  { category: "Immersions",      name: "Bharat Summer Fellowship",                                duration: "6 Weeks",   appFee: 500,   admFee: 50000, tuitionFee: 1150000 },
  { category: "MasterCamp",      name: "Strategic Business Management (SBM)",                     duration: "12 months", appFee: 500,   admFee: 50000, tuitionFee: 2050000 },
];

const fmtINR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function EmiCalculator() {
  const [partner, setPartner] = useState("");
  const [amount, setAmount] = useState(2000000);
  const [rate, setRate] = useState(12.0);
  const [tenure, setTenure] = useState(24);

  const calculate = () => {
    const P = amount || 0;
    const r = rate / 12 / 100;
    const n = tenure || 1;

    let emi = 0, totalPayment = 0, totalInterest = 0;
    if (P > 0 && rate > 0 && n > 0) {
      emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalPayment = emi * n;
      totalInterest = totalPayment - P;
    }

    return { emi, P, totalPayment, totalInterest, n };
  };

  const res = calculate();
  const principalPct = res.totalPayment > 0 ? Math.round((res.P / res.totalPayment) * 100) : 70;

  const handleCopy = () => {
    const yrs = res.n >= 12 ? Math.floor(res.n / 12) + (res.n % 12 > 0 ? " yr " + (res.n % 12) + " mo" : " yr") : res.n + " months";
    const interestPct = res.totalPayment > 0 ? ((res.totalInterest / res.totalPayment) * 100).toFixed(1) : "0";
    const lines = [
      "*LOAN EMI BREAKDOWN*", "─────────────────────────", "",
      "Loan Amount:      " + fmtINR(res.P), "Interest Rate:    " + rate + "% p.a.", "Tenure:           " + yrs, "",
      "─────────────────────────", "*Monthly EMI:     " + fmtINR(res.emi) + "*", "─────────────────────────", "",
      "Principal:        " + fmtINR(res.P), "Total Interest:   " + fmtINR(res.totalInterest) + " (" + interestPct + "%)", "",
      "*Total Repayment: " + fmtINR(res.totalPayment) + "*"
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="bg-[var(--bolt-bg-depth-2)] rounded-2xl p-6 border border-[var(--bolt-border-color)]">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--bolt-text-primary)]">
        <Calculator className="w-5 h-5" /> EMI Calculator
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4 min-w-0">
          <div>
            <label className="block text-sm font-medium text-[var(--bolt-text-secondary)] mb-1">Lending Partner</label>
            <select
              className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
              value={partner}
              onChange={(e) => {
                setPartner(e.target.value);
                if (e.target.value) setRate(parseFloat(e.target.value));
              }}
            >
              <option value="">-- Custom --</option>
              <option value="10.25">Tata Capital (10.25%)</option>
              <option value="11.25">HDFC Credila (11.25%)</option>
              <option value="13.00">Propelld (13.00%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--bolt-text-secondary)] mb-1">Loan Amount (₹)</label>
            <input
              type="number"
              className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--bolt-text-secondary)] mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--bolt-text-secondary)] mb-1">Tenure (Months)</label>
              <input
                type="number"
                className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[12, 24, 36, 48, 60].map((mo) => (
              <button
                key={mo}
                onClick={() => setTenure(mo)}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors",
                  tenure === mo
                    ? "bg-[var(--bolt-accent)] text-white border-[var(--bolt-accent)]"
                    : "bg-[var(--bolt-bg-depth-3)] border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
                )}
              >
                {mo} mo
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-[var(--bolt-bg-depth-3)] rounded-xl p-6 border border-[var(--bolt-border-color)] h-full">
            <div className="text-center mb-6 pb-6 border-b border-[var(--bolt-border-color)]">
              <div className="text-sm text-[var(--bolt-text-secondary)] mb-1 font-medium uppercase tracking-wider">Monthly EMI</div>
              <div className="text-4xl font-bold text-[var(--bolt-accent)]">{fmtINR(res.emi)}</div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bolt-text-secondary)]">Principal</span>
                <span className="font-semibold text-[var(--bolt-text-primary)]">{fmtINR(res.P)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bolt-text-secondary)]">Total Interest</span>
                <span className="font-semibold text-[var(--bolt-text-primary)]">{fmtINR(res.totalInterest)}</span>
              </div>
              <div className="w-full bg-[var(--bolt-bg-depth-1)] h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div style={{ width: `${principalPct}%` }} className="bg-[var(--bolt-accent)] h-full" />
                <div style={{ width: `${100 - principalPct}%` }} className="bg-orange-500 h-full" />
              </div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mt-1">
                <span>Principal {principalPct}%</span>
                <span>Interest {100 - principalPct}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--bolt-border-color)]">
              <span className="font-medium text-[var(--bolt-text-primary)]">Total Repayment</span>
              <span className="text-lg font-bold text-[var(--bolt-text-primary)]">{fmtINR(res.totalPayment)}</span>
            </div>

            <button 
              onClick={handleCopy}
              className="mt-6 w-full py-3 bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] font-semibold rounded-xl border border-[var(--bolt-accent)]/20 hover:bg-[var(--bolt-accent)]/20 transition-colors"
            >
              Copy EMI Summary for WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeeCalculator() {
  const [courseIdx, setCourseIdx] = useState(0);
  const [scholarshipPct, setScholarshipPct] = useState(0);
  const [otpOn, setOtpOn] = useState(false);

  const course = COURSES[courseIdx];

  const calculate = () => {
    const scholarship = (course.tuitionFee * scholarshipPct) / 100;
    const afterScholarship = course.tuitionFee - scholarship;
    const otpDiscount = otpOn ? afterScholarship * 0.03 : 0;
    const netTuition = afterScholarship - otpDiscount;
    const total = course.appFee + course.admFee + netTuition;
    const totalSaved = scholarship + otpDiscount;

    return { scholarship, otpDiscount, netTuition, total, totalSaved };
  };

  const res = calculate();

  return (
    <div className="bg-[var(--bolt-bg-depth-2)] rounded-2xl p-6 border border-[var(--bolt-border-color)]">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--bolt-text-primary)]">
        <FileText className="w-5 h-5" /> Course Fee Calculator
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5 min-w-0">
          <div>
            <label className="block text-sm font-medium text-[var(--bolt-text-secondary)] mb-1">Select Program</label>
            <select
              className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl px-4 py-3 text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
              value={courseIdx}
              onChange={(e) => setCourseIdx(Number(e.target.value))}
            >
              {COURSES.map((c, i) => (
                <option key={i} value={i}>{c.category} - {c.name}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">{course.category}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">{course.duration}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-[var(--bolt-border-color)] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bolt-text-secondary)]">Application Fee</span>
              <span className="font-semibold text-[var(--bolt-text-primary)]">{fmtINR(course.appFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bolt-text-secondary)]">Admission / Booking Fee</span>
              <span className="font-semibold text-[var(--bolt-text-primary)]">{fmtINR(course.admFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--bolt-text-secondary)]">Base Tuition Fee</span>
              <span className="font-semibold text-[var(--bolt-text-primary)]">{fmtINR(course.tuitionFee)}</span>
            </div>
          </div>

          <div className="border-t border-[var(--bolt-border-color)] pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--bolt-text-primary)]">Scholarship / Discount %</label>
              <input
                type="number"
                className="w-20 bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-lg px-2 py-1 text-right text-[var(--bolt-text-primary)] outline-none focus:border-[var(--bolt-accent)] transition-colors"
                value={scholarshipPct}
                onChange={(e) => setScholarshipPct(Number(e.target.value))}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={scholarshipPct}
              onChange={(e) => setScholarshipPct(Number(e.target.value))}
              className="w-full accent-[var(--bolt-accent)]"
            />
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {[0, 10, 25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setScholarshipPct(pct)}
                  className={cn(
                    "px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-colors",
                    scholarshipPct === pct
                      ? "bg-[var(--bolt-accent)] text-white border-[var(--bolt-accent)]"
                      : "bg-[var(--bolt-bg-depth-3)] border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] cursor-pointer mt-4">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[var(--bolt-accent)]"
              checked={otpOn}
              onChange={(e) => setOtpOn(e.target.checked)}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--bolt-text-primary)]">One-Time Payment Discount</span>
              <span className="text-xs text-[var(--bolt-text-secondary)]">Extra 3% off tuition after scholarship</span>
            </div>
          </label>
        </div>

        <div>
          <div className="bg-[var(--bolt-bg-depth-3)] rounded-xl p-6 border border-[var(--bolt-border-color)] h-full">
            <div className="text-lg font-bold mb-4 text-[var(--bolt-text-primary)] border-b border-[var(--bolt-border-color)] pb-2">Fee Breakdown</div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bolt-text-secondary)]">Tuition Fee</span>
                <span className="font-medium text-[var(--bolt-text-primary)]">{fmtINR(course.tuitionFee)}</span>
              </div>
              {scholarshipPct > 0 && (
                <div className="flex justify-between text-sm text-green-500 font-medium">
                  <span>Scholarship ({scholarshipPct}%)</span>
                  <span>− {fmtINR(res.scholarship)}</span>
                </div>
              )}
              {otpOn && (
                <div className="flex justify-between text-sm text-green-500 font-medium">
                  <span>OTP Discount (3%)</span>
                  <span>− {fmtINR(res.otpDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[var(--bolt-border-color)]">
                <span className="text-[var(--bolt-text-primary)]">Net Tuition Fee</span>
                <span className="text-[var(--bolt-text-primary)]">{fmtINR(res.netTuition)}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bolt-text-secondary)]">Application Fee</span>
                <span className="font-medium text-[var(--bolt-text-primary)]">{fmtINR(course.appFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bolt-text-secondary)]">Admission / Booking Fee</span>
                <span className="font-medium text-[var(--bolt-text-primary)]">{fmtINR(course.admFee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--bolt-border-color)] mb-4">
              <span className="font-bold text-[var(--bolt-text-primary)] text-lg">Total Fee</span>
              <span className="text-2xl font-bold text-[var(--bolt-accent)]">{fmtINR(res.total)}</span>
            </div>

            {res.totalSaved > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg p-3 text-sm text-center font-medium mb-4">
                You save {fmtINR(res.totalSaved)} ({(res.totalSaved / course.tuitionFee * 100).toFixed(1)}% off tuition)
              </div>
            )}

            <button 
              onClick={() => {
                const text = `*Course Fee Breakdown*\n` +
                  `Program: ${course.name}\n` +
                  `Duration: ${course.duration}\n\n` +
                  `*Base Fees:*\n` +
                  `Tuition Fee: ${fmtINR(course.tuitionFee)}\n` +
                  `Application Fee: ${fmtINR(course.appFee)}\n` +
                  `Admission Fee: ${fmtINR(course.admFee)}\n\n` +
                  (res.totalSaved > 0 ? `*Discounts:*\n` : '') +
                  (scholarshipPct > 0 ? `Scholarship (${scholarshipPct}%): -${fmtINR(res.scholarship)}\n` : '') +
                  (otpOn ? `One-Time Payment Discount (3%): -${fmtINR(res.otpDiscount)}\n` : '') +
                  (res.totalSaved > 0 ? `Total Savings: ${fmtINR(res.totalSaved)}\n\n` : '') +
                  `*Net Payable Amount:* ${fmtINR(res.total)}\n`;
                
                navigator.clipboard.writeText(text);
                toast.success("Fee breakdown copied to clipboard");
              }}
              className="w-full py-3 bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] font-semibold rounded-xl border border-[var(--bolt-accent)]/20 hover:bg-[var(--bolt-accent)]/20 transition-colors"
            >
              Copy Breakdown for WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<"emi" | "fee">("emi");

  return (
    <div className="w-full h-full pb-10">
      <h1 className="text-2xl font-bold text-[var(--bolt-text-primary)] mb-6">Tools & Calculators</h1>
      
      <div className="flex gap-4 mb-6 border-b border-[var(--bolt-border-color)] pb-px">
        <button
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === "emi"
              ? "text-[var(--bolt-accent)]"
              : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
          )}
          onClick={() => setActiveTab("emi")}
        >
          EMI Calculator
          {activeTab === "emi" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bolt-accent)] rounded-t-full" />
          )}
        </button>
        <button
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === "fee"
              ? "text-[var(--bolt-accent)]"
              : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
          )}
          onClick={() => setActiveTab("fee")}
        >
          Program Fee Calculator
          {activeTab === "fee" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--bolt-accent)] rounded-t-full" />
          )}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "emi" ? <EmiCalculator /> : <FeeCalculator />}
      </div>
    </div>
  );
}
