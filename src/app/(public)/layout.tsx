import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Public Header */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Bolt CRM" className="h-8" />
          <span className="font-bold text-xl tracking-tight">Bolt CRM</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/#features" className="hidden md:block text-white/70 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="hidden md:block text-white/70 hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" className="hidden md:block text-white/70 hover:text-white transition-colors">Contact</Link>
          <div className="w-px h-4 bg-white/20 hidden md:block" />
          <Link href="/login" className="text-white hover:text-[#eab308] transition-colors">Log In</Link>
          <Link href="/login" className="bg-[#eab308] hover:bg-[#eab308]/90 text-white px-5 py-2.5 rounded-full transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">Get Started</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Bolt CRM" className="h-6 opacity-80 grayscale" />
              <span className="font-bold text-lg tracking-tight text-white/90">Bolt CRM</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              The ultimate B2B SaaS platform for educational institutions and businesses to manage leads, track admissions, and drive conversions seamlessly.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Cancellation & Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li>support@boltcrm.com</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Bolt CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
