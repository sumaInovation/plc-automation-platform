'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useSession, signOut } from 'next-auth/react';
import { useQuoteStore } from '@/store/quoteStore';

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
  )
}
function QuoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )
}

export default function Navbar() {
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const quoteCount = useQuoteStore((s) => s.getItemCount());
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const Badge = ({ count, color }) => {
    if (!hasHydrated || count === 0) return null;
    return (
      <span className={`absolute -top-1.5 -right-1.5 ${color} text-white text- font-bold min-w- h- px-1 flex items-center justify-center rounded-full ring-2 ring-white`}>
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  return (
    <nav className="border-b border-slate-100 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h- flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Suma Automation" width={160} height={75} priority className="h-9 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex gap-7 items-center text- font-medium text-slate-600">
          <Link href="/shop" className="hover:text-slate-900 transition">Shop</Link>
          <Link href="/courses" className="hover:text-slate-900 transition">Courses</Link>
          
          {/* Cart + Quote Group - lassanata pill wage */}
          <div className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-50 rounded-full border border-slate-200">
            <Link href="/quote-cart" className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-700">
              <QuoteIcon />
              <span>Quote</span>
              <Badge count={quoteCount} color="bg-amber-500" />
            </Link>
            <div className="w-px h-5 bg-slate-200"></div>
            <Link href="/cart" className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-black transition-all shadow-sm">
              <CartIcon />
              <span>Cart</span>
              {hasHydrated && itemCount > 0 && (
                <span className="bg-white text-slate-900 text- font-bold min-w- h- px-1 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {status === 'loading' ? null : session ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {session?.user?.role === 'admin' && (
                <div className="flex items-center gap-1.5">
                  {[
                    { href: '/admin/orders', label: 'Orders' },
                    { href: '/admin/quotations', label: 'Quotes' },
                    { href: '/admin/products', label: 'Products' },
                    { href: '/admin/courses', label: 'Courses' },
                    { href: '/admin/enrollments', label: 'Enroll' },
                  ].map(l => (
                    <Link key={l.href} href={l.href} className="px-2.5 py-1 text- font-semibold text-slate-600 bg-white border rounded-full hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition">{l.label}</Link>
                  ))}
                </div>
              )}
              <Link href="/dashboard" className="text-slate-800 font-semibold hover:text-blue-600">{session?.user?.name?.split(' ')[0]}</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-full transition-all">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm">Login</Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-1">
          <Link href="/quote-cart" className="relative p-2.5 rounded-full bg-slate-50 border border-slate-200">
            <QuoteIcon />
            <Badge count={quoteCount} color="bg-amber-500" />
          </Link>
          <Link href="/cart" className="relative p-2.5 rounded-full bg-slate-900 text-white">
            <CartIcon />
            {hasHydrated && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text- font-bold min-w- h- flex items-center justify-center rounded-full ring-2 ring-white">{itemCount}</span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2.5 ml-1 text-slate-700 bg-white border border-slate-200 rounded-full">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 animate-in">
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="flex justify-between items-center text- font-medium text-slate-800 py-3 border-b border-slate-50">Shop <span>→</span></Link>
          <Link href="/courses" onClick={() => setMenuOpen(false)} className="flex justify-between items-center text- font-medium text-slate-800 py-3 border-b border-slate-50">Courses <span>→</span></Link>
          
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Link href="/quote-cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">
              <QuoteIcon /> Quote {quoteCount > 0 && `(${quoteCount})`}
            </Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-sm font-semibold">
              <CartIcon /> Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
          </div>

          {session?.user?.role === 'admin' && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Link href="/admin/orders" onClick={() => setMenuOpen(false)} className="text-center py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">Orders</Link>
              <Link href="/admin/quotations" onClick={() => setMenuOpen(false)} className="text-center py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">Quotes</Link>
              <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="text-center py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">Products</Link>
              <Link href="/admin/courses" onClick={() => setMenuOpen(false)} className="text-center py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">Courses</Link>
              <Link href="/admin/enrollments" onClick={() => setMenuOpen(false)} className="text-center py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full col-span-2">Enrollments</Link>
            </div>
          )}

          <div className="pt-4">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-center py-3 bg-slate-50 rounded-xl font-semibold">{session.user.name}</Link>
                <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }} className="w-full mt-2 py-3 text-sm font-medium text-rose-600 border border-rose-200 rounded-xl">Logout</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-center py-3 text-white bg-blue-600 rounded-xl font-semibold">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}