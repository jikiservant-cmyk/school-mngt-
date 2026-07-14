import { createClient } from '@/utils/supabase/server';
import { logoutAction } from '@/app/login/actions';
import Sidebar from './Sidebar';

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
      <Sidebar 
        schoolName={schoolName} 
        adminName={adminName} 
        initials={initials} 
        logoutFormAction={logoutAction} 
      />

      {/* Main Container */}
      <main className="flex-1 min-h-screen flex flex-col relative pt-16 md:pt-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
