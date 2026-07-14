'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signupAction } from './actions';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await signupAction(formData);
        if (result && result.error) {
          setError(result.error);
        }
      } catch (err: any) {
        if (err?.message?.includes('NEXT_REDIRECT')) {
          return;
        }
        setError(err?.message || 'An unexpected error occurred during registration. Please try again.');
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-meridian-deep p-4">
      <div className="w-full max-w-md p-10 bg-meridian-panel rounded-2xl border border-meridian-border relative overflow-hidden shadow-sm">
        
        {/* Logo/Brand Indicator */}
        <div className="flex flex-col items-center mb-6 text-center">
          <svg className="w-10 h-10 mb-3" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="13.5" fill="none" stroke="#A9B594" strokeWidth="1"/>
            <circle cx="15" cy="15" r="9.5" fill="none" stroke="#7C9268" strokeWidth="1"/>
            <circle cx="15" cy="15" r="5" fill="none" stroke="#9C7A3C" strokeWidth="1.2"/>
            <circle cx="15" cy="15" r="1.6" fill="#9C7A3C"/>
          </svg>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-meridian-text-1">Register</h1>
          <p className="text-[11px] font-mono uppercase tracking-widest text-meridian-text-3 mt-1">
            Setup School Administrator
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-mono text-meridian-loss bg-[#F7EBE8] rounded-lg border border-[#EAC2BA] animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-mono uppercase tracking-wider text-meridian-text-2">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 bg-meridian-panel-raised border border-meridian-border text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-gold focus:border-meridian-gold transition-colors disabled:opacity-50 text-meridian-text-1"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-meridian-text-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 bg-meridian-panel-raised border border-meridian-border text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-gold focus:border-meridian-gold transition-colors disabled:opacity-50 text-meridian-text-1"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-meridian-text-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              disabled={isPending}
              className="w-full px-3 py-2.5 bg-meridian-panel-raised border border-meridian-border text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-meridian-gold focus:border-meridian-gold transition-colors disabled:opacity-50 text-meridian-text-1"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 py-2.5 px-4 text-sm font-medium text-[#FBFAF3] bg-meridian-gold hover:bg-meridian-gold-dim border border-transparent rounded-lg transition duration-200 disabled:opacity-75 flex items-center justify-center cursor-pointer shadow-sm"
          >
            {isPending ? 'Provisioning School...' : 'Register Portal'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-meridian-border text-center text-xs text-meridian-text-2">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-meridian-gold font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
