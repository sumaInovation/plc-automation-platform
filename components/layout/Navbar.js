'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useSession, signOut } from 'next-auth/react';
import { useQuoteStore } from '@/store/quoteStore';

export default function Navbar() {
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
   const quoteCount = useQuoteStore((state) => state.getItemCount());

  return (
    <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="Suma Automation" width={160} height={75} priority className="h-9 w-auto" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-600">
          <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
          <Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
          <Link href="/cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1">
            <span>🛒</span><span>Cart</span>
            {hasHydrated && itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>
             <Link href="/quote-cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1">
  <span>📋</span><span className="hidden sm:inline">Quote</span>
  {hasHydrated && quoteCount > 0 && (
    <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center ring-2 ring-white">
      {quoteCount}
    </span>
  )}
</Link>

          {status === 'loading' ? null : session ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
             {session?.user?.role === 'admin' && (
  <div className="flex items-center gap-2">
    <Link href="/admin/orders" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">Orders</Link>
    <Link href="/admin/enrollments" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">Enrollments</Link>
    <Link href="/admin/products" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">Products</Link>
    <Link href="/admin/courses" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">Courses</Link>
    <Link href="/admin/quotations" className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full hover:bg-purple-100">Quotations</Link>
  </div>
)}
              <Link href="/dashboard" className="text-slate-700 hover:text-slate-900 font-semibold">{session?.user?.name}</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 hover:bg-rose-600 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
              Login
            </Link>
          )}
        </div>

        {/* Mobile — Cart icon + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/cart" className="relative p-2 text-slate-700">
            <span className="text-lg">🛒</span>
            {hasHydrated && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          <Link href="/quote-cart" className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1">
  <span>📋</span><span className="hidden sm:inline">Quote</span>
  {hasHydrated && quoteCount > 0 && (
    <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center ring-2 ring-white">
      {quoteCount}
    </span>
  )}
</Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-700"
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Shop</Link>
          <Link href="/courses" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Courses</Link>

          {status === 'loading' ? null : session ? (
            <div className="pt-3 border-t border-slate-100 space-y-3">
             {session?.user?.role === 'admin' && (
  <div className="grid grid-cols-2 gap-2">
    <Link href="/admin/orders" onClick={() => setMenuOpen(false)} className="text-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Orders</Link>
    <Link href="/admin/enrollments" onClick={() => setMenuOpen(false)} className="text-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Enrollments</Link>
    <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="text-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Products</Link>
    <Link href="/admin/courses" onClick={() => setMenuOpen(false)} className="text-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Courses</Link>
    <Link href="/admin/quotations" onClick={() => setMenuOpen(false)} className="text-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-full">Quotations</Link>
  </div>
)}
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-2">
                {session?.user?.name}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="w-full text-center px-3 py-2 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}