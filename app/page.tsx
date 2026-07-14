import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-meridian-deep text-meridian-text-1 flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-meridian-panel border border-meridian-border rounded-2xl p-10 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -bottom-16 opacity-30 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="50" fill="none" stroke="#C4CDB2" strokeWidth="1"/>
            <circle cx="100" cy="100" r="70" fill="none" stroke="#C4CDB2" strokeWidth="1"/>
            <circle cx="100" cy="100" r="90" fill="none" stroke="#C4CDB2" strokeWidth="1"/>
          </svg>
        </div>

        {/* Brand Mark */}
        <div className="mb-6">
          <svg className="w-16 h-16" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="13.5" fill="none" stroke="#A9B594" strokeWidth="1"/>
            <circle cx="15" cy="15" r="9.5" fill="none" stroke="#7C9268" strokeWidth="1"/>
            <circle cx="15" cy="15" r="5" fill="none" stroke="#9C7A3C" strokeWidth="1.2"/>
            <circle cx="15" cy="15" r="1.6" fill="#9C7A3C"/>
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-medium tracking-tight mb-2">
          Meridian Academy
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-meridian-text-3 mb-8">
          School Attendance Portal
        </p>

        <div className="w-full space-y-3 relative z-10">
          <Link 
            href="/login" 
            className="block w-full py-3 px-4 bg-meridian-panel-raised hover:bg-meridian-border border border-meridian-border rounded-lg text-sm font-medium transition text-meridian-text-1"
          >
            Sign In to Portal
          </Link>
          
          <Link 
            href="/signup" 
            className="block w-full py-3 px-4 bg-meridian-gold hover:bg-meridian-gold-dim text-[#FBFAF3] border border-meridian-gold rounded-lg text-sm font-medium transition"
          >
            Register School Admin
          </Link>

          <div className="pt-4 border-t border-meridian-border mt-4">
            <Link 
              href="/mark-attendance" 
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-meridian-text-2 hover:text-meridian-gold transition"
            >
              <span className="w-2 h-2 rounded-full bg-meridian-gold animate-pulse"></span>
              Device Terminal Mode
            </Link>
          </div>
        </div>

        <div className="mt-8 text-[10.5px] font-mono text-meridian-text-3">
          Est. 2026 · Secure Academic Database
        </div>
      </div>
    </div>
  );
}
