'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Smartphone, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  schoolName: string;
  adminName: string;
  initials: string;
  logoutFormAction: any;
}

export default function Sidebar({ schoolName, adminName, initials, logoutFormAction }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/classes', label: 'Classes', icon: GraduationCap },
    { href: '/dashboard/people', label: 'People', icon: Users },
    { href: '/dashboard/devices', label: 'Devices', icon: Smartphone },
  ];

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar (sticky/fixed header visible only on small screens) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#CFD8C1] border-b border-meridian-border flex items-center justify-between px-4 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <svg className="w-7 h-7 shrink-0" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="13.5" fill="none" stroke="#A9B594" strokeWidth="1"/>
            <circle cx="15" cy="15" r="9.5" fill="none" stroke="#7C9268" strokeWidth="1"/>
            <circle cx="15" cy="15" r="5" fill="none" stroke="#9C7A3C" strokeWidth="1.2"/>
            <circle cx="15" cy="15" r="1.6" fill="#9C7A3C"/>
          </svg>
          <div>
            <div className="font-serif text-base font-semibold leading-none tracking-tight text-meridian-text-1">
              Meridian
            </div>
            <div className="text-[9px] font-mono tracking-wider uppercase text-meridian-text-3 mt-0.5 truncate max-w-[150px]">
              {schoolName}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-[#A9B594]/30 hover:bg-[#A9B594]/50 border border-meridian-border rounded-lg text-meridian-text-1 cursor-pointer transition active:scale-95"
          title={isMobileOpen ? "Close Menu" : "Open Menu"}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside Drawer */}
      <aside 
        className={`bg-[#CFD8C1] border-r border-meridian-border flex flex-col justify-between p-5 shrink-0 transition-all duration-300 ease-in-out
          /* Mobile: Drawer layout */
          fixed inset-y-0 left-0 z-50 w-64 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop: Normal column */
          md:relative md:translate-x-0 md:h-screen md:sticky md:top-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 bg-[#A9B594] border border-meridian-border hover:bg-[#99A683] text-meridian-text-1 w-6 h-6 rounded-full items-center justify-center cursor-pointer transition shadow-md z-50 hover:scale-105 active:scale-95"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="space-y-8 overflow-hidden">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 shrink-0" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="13.5" fill="none" stroke="#A9B594" strokeWidth="1"/>
              <circle cx="15" cy="15" r="9.5" fill="none" stroke="#7C9268" strokeWidth="1"/>
              <circle cx="15" cy="15" r="5" fill="none" stroke="#9C7A3C" strokeWidth="1.2"/>
              <circle cx="15" cy="15" r="1.6" fill="#9C7A3C"/>
            </svg>
            {/* Always visible on mobile (since width is always w-64 when open), and responsive on desktop */}
            <div className={`animate-fade-in whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <div className="font-serif text-lg font-medium leading-none tracking-tight text-meridian-text-1">
                Meridian
              </div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-meridian-text-3 mt-1 truncate max-w-[150px]">
                {schoolName}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#A9B594]/30 text-meridian-text-1 font-medium border border-[#A9B594]/40 shadow-sm' 
                      : 'text-meridian-text-2 hover:bg-meridian-panel-raised hover:text-meridian-text-1'
                  }`}
                  title={(isCollapsed && !isMobileOpen) ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 text-meridian-gold shrink-0" />
                  <span className={`animate-fade-in whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Active Admin profile & Logout */}
        <div className="pt-4 border-t border-meridian-border space-y-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-meridian-panel-raised border border-meridian-gold flex items-center justify-center font-serif text-xs font-medium text-meridian-gold uppercase shrink-0">
              {initials}
            </div>
            <div className={`min-w-0 flex-1 animate-fade-in whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <div className="text-xs font-medium text-meridian-text-1 truncate">{adminName}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-meridian-text-3 truncate">
                Admin Session
              </div>
            </div>
          </div>

          <form action={logoutFormAction}>
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-meridian-panel hover:bg-meridian-panel-raised border border-meridian-border rounded-lg text-xs font-medium text-meridian-loss hover:text-[#95502F] transition duration-150 cursor-pointer"
              title={(isCollapsed && !isMobileOpen) ? "Sign Out" : undefined}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className={`animate-fade-in whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>
                Sign Out Session
              </span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
