import { createClient } from '@/utils/supabase/server';
import { 
  TrendingUp, 
  Users, 
  School, 
  Cpu, 
  UserCheck,
  ChevronRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import QueueWorker from './QueueWorker';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch live metrics from database
  let studentCount = 0;
  let teacherCount = 0;
  let classCount = 0;
  let deviceCount = 0;
  let recentLogs: any[] = [];
  let notificationsList: any[] = [];
  let schoolName = 'your school';
  let adminName = 'Adaeze';

  try {
    // Get user details
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      adminName = user.user_metadata?.full_name?.split(' ')[0] || 'Administrator';
      
      const { data: staffData } = await supabase
        .from('staff_users')
        .select('people(full_name, schools(name))')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (staffData && staffData.people) {
        const p = staffData.people as any;
        schoolName = p.schools?.name || 'your school';
      }
    }

    // Run parallel count requests
    const [
      { count: students },
      { count: teachers },
      { count: classes },
      { count: devices }
    ] = await Promise.all([
      supabase.from('people').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('people').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('devices').select('*', { count: 'exact', head: true })
    ]);

    studentCount = students || 0;
    teacherCount = teachers || 0;
    classCount = classes || 0;
    deviceCount = devices || 0;

    // Fetch recent 5 logs
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select(`
        id,
        status,
        occurred_at,
        source,
        people (
          full_name,
          role
        ),
        classes:classes(
          name
        )
      `)
      .order('occurred_at', { ascending: false })
      .limit(5);

    recentLogs = logs || [];

    // Fetch recent 10 notifications
    const { data: queue } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    notificationsList = queue || [];
  } catch (error) {
    console.error('Error loading dashboard telemetry:', error);
  }

  // Determine dynamic greeting
  const hour = new Date().getHours();
  let greeting = 'Good day';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  // Format localized current date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate generic school ratios
  const totalPeople = studentCount + teacherCount;
  const studentRatio = totalPeople > 0 ? Math.round((studentCount / totalPeople) * 100) : 100;
  const teacherRatio = totalPeople > 0 ? Math.round((teacherCount / totalPeople) * 100) : 0;

  const activeLogs = recentLogs;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-2 pb-2 border-b border-meridian-border">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-meridian-text-1">
            {greeting}, {adminName}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-meridian-text-3 mt-1">
            Overview / {schoolName}
          </p>
        </div>
        <div className="text-xs font-mono tracking-wider text-meridian-text-3 bg-meridian-panel-raised border border-meridian-border px-3 py-1.5 rounded-lg">
          {formattedDate}
        </div>
      </div>

      {/* Meridian Hero Card */}
      <div className="relative bg-meridian-panel border border-meridian-border rounded-2xl p-8 md:p-10 overflow-hidden shadow-sm">
        
        {/* Intricate Geometric Circles SVG overlay */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-25 md:opacity-90 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 260 260" className="translate-x-12 select-none">
            <circle cx="130" cy="130" r="60" fill="none" stroke="#C4CDB2" strokeWidth="1"/>
            <circle cx="130" cy="130" r="82" fill="none" stroke="#C4CDB2" strokeWidth="1"/>
            <circle cx="130" cy="130" r="104" fill="none" stroke="#CFD8C0" strokeWidth="1"/>
            <circle cx="130" cy="130" r="126" fill="none" stroke="#D7DECB" strokeWidth="1"/>
            <path d="M130 130 m0 -104 a104 104 0 0 1 88 155" fill="none" stroke="#9C7A3C" strokeWidth="1.6"/>
          </svg>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="text-xs font-mono uppercase tracking-widest text-meridian-text-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-meridian-gold animate-pulse" />
            Daily Attendance Rate
          </div>
          
          <div className="font-serif text-5xl md:text-6xl font-medium tracking-tight text-meridian-text-1">
            94.2<span className="text-2xl md:text-3xl text-meridian-text-3 font-normal">%</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-meridian-gain">
            <span className="inline-flex items-center gap-1 bg-[#E1EAD9] border border-[#CBD8C1] px-2 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
              +2.4% this week
            </span>
            <span className="text-meridian-text-3">
              across {classCount || 4} academic terms
            </span>
          </div>

          <p className="text-xs text-meridian-text-3">
            Active mode: <span className="font-semibold text-meridian-text-2">ADMS Biometric + Teacher Override</span> · Sync interval: 15s
          </p>
        </div>
      </div>

      {/* KPI 4-Column Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-meridian-panel border border-meridian-border rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-widest text-meridian-text-3 mb-2">
            Total Students
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-meridian-text-1">
              {studentCount}
            </span>
            <span className="text-xs font-mono text-meridian-text-3">enrolled</span>
          </div>
        </div>

        <div className="bg-meridian-panel border border-meridian-border rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-widest text-meridian-text-3 mb-2">
            Faculty & Staff
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-meridian-text-1">
              {teacherCount}
            </span>
            <span className="text-xs font-mono text-meridian-text-3">active</span>
          </div>
        </div>

        <div className="bg-meridian-panel border border-meridian-border rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-widest text-meridian-text-3 mb-2">
            Classrooms
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-meridian-text-1">
              {classCount}
            </span>
            <span className="text-xs font-mono text-meridian-text-3">registered</span>
          </div>
        </div>

        <div className="bg-meridian-panel border border-meridian-border rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-widest text-meridian-text-3 mb-2">
            ADMS Terminals
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-medium text-meridian-text-1">
              {deviceCount}
            </span>
            <span className="text-xs font-mono text-meridian-gain flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-meridian-gain inline-block animate-ping"></span>
              Online
            </span>
          </div>
        </div>

      </div>

      {/* Performance Graph & Demographics Breakdown (Grid 2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance Trends (8 cols) */}
        <div className="bg-meridian-panel border border-meridian-border rounded-2xl p-6 lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-meridian-border">
            <h3 className="font-serif text-lg font-medium text-meridian-text-1">
              Weekly Attendance Trends
            </h3>
            <div className="flex gap-1.5 bg-meridian-deep border border-meridian-border p-0.5 rounded-lg">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-meridian-panel-raised text-meridian-gold font-medium">1W</span>
              <span className="text-[10px] font-mono px-2 py-1 rounded text-meridian-text-3 hover:text-meridian-text-1 cursor-pointer">1M</span>
              <span className="text-[10px] font-mono px-2 py-1 rounded text-meridian-text-3 hover:text-meridian-text-1 cursor-pointer">All</span>
            </div>
          </div>

          {/* Fluid pure SVG line graph matching ChartJS aesthetic */}
          <div className="relative h-60 w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7CAE84" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#7CAE84" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Grid guide lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* Area under the line */}
              <path 
                d="M 0 170 C 50 150, 100 180, 150 120 C 200 100, 250 130, 300 80 C 350 90, 400 60, 450 70 C 480 65, 500 45, 500 45 L 500 220 L 0 220 Z" 
                fill="url(#chartGrad)" 
              />

              {/* Beautiful custom-drawn smooth cubic spline curve line */}
              <path 
                d="M 0 170 C 50 150, 100 180, 150 120 C 200 100, 250 130, 300 80 C 350 90, 400 60, 450 70 C 480 65, 500 45, 500 45" 
                fill="none" 
                stroke="#7CAE84" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Dynamic highlights / points */}
              <circle cx="150" cy="120" r="4" fill="#7CAE84" stroke="#EEF1E4" strokeWidth="2" />
              <circle cx="300" cy="80" r="4" fill="#7CAE84" stroke="#EEF1E4" strokeWidth="2" />
              <circle cx="500" cy="45" r="5" fill="#9C7A3C" stroke="#EEF1E4" strokeWidth="2" />
            </svg>

            {/* Labels overlay */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] font-mono text-meridian-text-3 px-1 pt-1 border-t border-meridian-border">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Demographics Breakdown (4 cols) */}
        <div className="bg-meridian-panel border border-meridian-border rounded-2xl p-6 lg:col-span-4 space-y-4">
          <div className="pb-2 border-b border-meridian-border">
            <h3 className="font-serif text-lg font-medium text-meridian-text-1">
              Demographics
            </h3>
          </div>

          <div className="flex flex-col items-center py-4">
            
            {/* Elegant SVG donut visualizer */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="58" fill="none" stroke="#D7DECB" strokeWidth="14"/>
                <circle cx="75" cy="75" r="58" fill="none" stroke="#7CAE84" strokeWidth="14" strokeDasharray={`${studentRatio * 3.64} 364`} strokeDashoffset="0"/>
                <circle cx="75" cy="75" r="58" fill="none" stroke="#C9A961" strokeWidth="14" strokeDasharray={`${teacherRatio * 3.64} 364`} strokeDashoffset={`-${studentRatio * 3.64}`}/>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-serif text-2xl font-bold text-meridian-text-1">
                  {totalPeople || 436}
                </span>
                <span className="text-[9px] font-mono uppercase text-meridian-text-3">
                  Accounts
                </span>
              </div>
            </div>

            {/* Demographics legends */}
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-meridian-text-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#7CAE84]"></span>
                  Students
                </span>
                <span className="font-mono font-medium text-meridian-text-1">
                  {studentRatio}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-meridian-text-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C9A961]"></span>
                  Faculty & Staff
                </span>
                <span className="font-mono font-medium text-meridian-text-1">
                  {teacherRatio}%
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Recent Activity Table (Full Wide Card) */}
      <div className="bg-meridian-panel border border-meridian-border rounded-2xl p-6">
        <div className="flex justify-between items-center pb-4 border-b border-meridian-border mb-4">
          <div>
            <h3 className="font-serif text-lg font-medium text-meridian-text-1">
              Recent Attendance Log
            </h3>
            <p className="text-[11px] text-meridian-text-3 font-mono mt-0.5">
              Live updates of classroom entry transactions
            </p>
          </div>
          <Link 
            href="/dashboard/people" 
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-meridian-gold hover:text-meridian-gold-dim transition"
          >
            Manage Accounts
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-meridian-border">
                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Person
                </th>
                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Role
                </th>
                <th className="text-left font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Scope/Class
                </th>
                <th className="text-center font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Source
                </th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Occurred At
                </th>
                <th className="text-right font-mono text-[10px] uppercase tracking-wider text-meridian-text-3 pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-meridian-border">
              {activeLogs.length > 0 ? (
                activeLogs.map((log) => {
                  const isPresent = log.status === 'present';
                  const isLate = log.status === 'late';
                  
                  return (
                    <tr key={log.id} className="hover:bg-meridian-panel-raised/30 transition-colors">
                      <td className="py-3.5 text-sm font-medium text-meridian-text-1">
                        {log.people?.full_name}
                      </td>
                      <td className="py-3.5 text-xs font-mono uppercase tracking-wider text-meridian-text-3">
                        {log.people?.role}
                      </td>
                      <td className="py-3.5 text-sm text-meridian-text-2">
                        {log.classes?.name || 'Form General'}
                      </td>
                      <td className="py-3.5 text-center text-xs font-mono">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${log.source === 'device' ? 'bg-meridian-deep text-meridian-text-1' : 'bg-meridian-panel-raised text-meridian-text-2'}`}>
                          {log.source === 'device' ? '⚡ Biometric' : '✍️ Manual'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-xs text-meridian-text-3">
                        {new Date(log.occurred_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="py-3.5 text-right font-mono text-xs">
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          isPresent 
                            ? 'bg-[#E1EAD9] text-meridian-gain' 
                            : isLate 
                              ? 'bg-[#FCF5E3] text-[#B58A33]' 
                              : 'bg-[#F7EBE8] text-meridian-loss'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-mono text-xs text-meridian-text-3">
                    No active attendance logs found in the database. Open the{" "}
                    <Link href="/mark-attendance" className="text-meridian-gold hover:underline font-semibold">
                      Terminal Emulator
                    </Link>{" "}
                    to clock in students or faculty members.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outbound Notification Queue Simulator */}
      <QueueWorker notifications={notificationsList} />

    </div>
  );
}
