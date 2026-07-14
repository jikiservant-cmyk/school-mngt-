import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Smartphone, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Fetch current logged-in user and administrative session
  let adminName = 'Administrator';
  let schoolName = 'Meridian Academy';
  let initials = 'AD';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch details from staff_users, people, and schools
      const { data: staffData } = await supabase
        .from('staff_users')
        .select(`
          staff_role,
          people (
            full_name,
            schools (
              name
            )
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (staffData && staffData.people) {
        const person = staffData.people as any;
        adminName = person.full_name || 'Administrator';
        schoolName = person.schools?.name || 'Meridian Academy';
        
        // Compute initials
        initials = adminName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'AD';
      } else {
        // Fallback to auth metadata if profile not provisioned fully yet
        adminName = user.user_metadata?.full_name || 'Administrator';
        initials = adminName.substring(0, 2).toUpperCase();
      }
    }
  } catch (err) {
    console.error('Error fetching admin context in layout:', err);
  }

  return (
    <div className="flex min-h-screen bg-meridian-deep text-meridian-text-1 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#CFD8C1] border-r border-meridian-border flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 shrink-0" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="13.5" fill="none" stroke="#A9B594" strokeWidth="1"/>
              <circle cx="15" cy="15" r="9.5" fill="none" stroke="#7C9268" strokeWidth="1"/>
              <circle cx="15" cy="15" r="5" fill="none" stroke="#9C7A3C" strokeWidth="1.2"/>
              <circle cx="15" cy="15" r="1.6" fill="#9C7A3C"/>
            </svg>
            <div>
              <div className="font-serif text-lg font-medium leading-none tracking-tight text-meridian-text-1">
                Meridian
              </div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-meridian-text-3 mt-1">
                {schoolName.substring(0, 20)}{schoolName.length > 20 ? '...' : ''}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-meridian-text-2 hover:bg-meridian-panel-raised hover:text-meridian-text-1"
            >
              <LayoutDashboard className="w-4 h-4 text-meridian-gold shrink-0" />
              <span>Overview</span>
            </Link>

            <Link 
              href="/dashboard/classes" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-meridian-text-2 hover:bg-meridian-panel-raised hover:text-meridian-text-1"
            >
              <GraduationCap className="w-4 h-4 text-meridian-gold shrink-0" />
              <span>Classes</span>
            </Link>

            <Link 
              href="/dashboard/people" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-meridian-text-2 hover:bg-meridian-panel-raised hover:text-meridian-text-1"
            >
              <Users className="w-4 h-4 text-meridian-gold shrink-0" />
              <span>People</span>
            </Link>

            <Link 
              href="/dashboard/devices" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-meridian-text-2 hover:bg-meridian-panel-raised hover:text-meridian-text-1"
            >
              <Smartphone className="w-4 h-4 text-meridian-gold shrink-0" />
              <span>Devices</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer with Active Admin profile & Logout */}
        <div className="pt-4 border-t border-meridian-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-meridian-panel-raised border border-meridian-gold flex items-center justify-center font-serif text-xs font-medium text-meridian-gold uppercase">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-meridian-text-1 truncate">{adminName}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-meridian-text-3 truncate">
                Admin Session
              </div>
            </div>
          </div>

          <form action={logoutAction}>
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-meridian-panel hover:bg-meridian-panel-raised border border-meridian-border rounded-lg text-xs font-medium text-meridian-loss hover:text-[#95502F] transition duration-150 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign Out Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 min-h-screen flex flex-col relative">
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
