'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
          PLC Automation
        </Link>

        <div className="flex gap-8 items-center text-sm font-medium text-slate-600">
          <Link href="/shop" className="hover:text-blue-600 transition-colors duration-200">
            Shop
          </Link>
          <Link href="/courses" className="hover:text-blue-600 transition-colors duration-200">
            Courses
          </Link>
          <Link href="/cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
            <span className="text-base">🛒</span>
            <span>Cart</span>
            {hasHydrated && itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center ring-2 ring-white animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          {status === 'loading' ? null : session ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            {session?.user?.role === 'admin' && (
  <div className="flex items-center gap-2">
    <Link href="/admin/orders" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors">
      Orders
    </Link>
    <Link href="/admin/enrollments" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors">
      Enrollments
    </Link>
  </div>
)}
              <Link href="/dashboard" className="text-slate-700 hover:text-slate-900 font-semibold transition-colors">
                {session?.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 hover:bg-rose-600 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95 transition-all duration-200">
              Login
            </Link>
          )}
            
            

        </div>
      </div>
    </nav>
  );
}
