import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bolt-bg-depth-1)] text-[var(--bolt-text-primary)]">
      {/* Public Header */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-[var(--bolt-border-color)] sticky top-0 bg-[var(--bolt-bg-depth-1)]/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/#features" className="hidden md:block text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors">Features</Link>
          <Link href="/#pricing" className="hidden md:block text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors">Pricing</Link>
          <Link href="/contact" className="hidden md:block text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors">Contact</Link>
          <div className="w-px h-4 bg-[var(--bolt-border-color)] hidden md:block" />
          <ThemeToggle />
          <Link href="/login" className="text-[var(--bolt-text-primary)] hover:text-[#eab308] transition-colors">Log In</Link>
          <Link href="/login" className="bg-[#eab308] hover:bg-[#eab308]/90 text-black px-5 py-2.5 rounded-full transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">Get Started</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-[var(--bolt-bg-depth-2)] border-t border-[var(--bolt-border-color)] pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src="/bolt-logo.png" alt="Bolt CRM" className="h-6 opacity-80 dark:grayscale grayscale-0" />
              <span className="font-bold text-lg tracking-tight text-[var(--bolt-text-primary)]">Bolt CRM</span>
            </Link>
            <p className="text-[var(--bolt-text-secondary)] text-sm leading-relaxed max-w-sm">
              The ultimate B2B SaaS platform for educational institutions and businesses to manage leads, track admissions, and drive conversions seamlessly.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[var(--bolt-text-primary)] mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-[var(--bolt-text-tertiary)]">
              <li><Link href="/terms" className="hover:text-[var(--bolt-text-primary)] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--bolt-text-primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-[var(--bolt-text-primary)] transition-colors">Cancellation & Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--bolt-text-primary)] mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-[var(--bolt-text-tertiary)]">
              <li><Link href="/contact" className="hover:text-[var(--bolt-text-primary)] transition-colors">Contact Us</Link></li>
              <li>jainishan18@gmail.com</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t border-[var(--bolt-border-color)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--bolt-text-tertiary)]">
          <p>© {new Date().getFullYear()} Bolt CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
