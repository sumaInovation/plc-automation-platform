'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useSession, signOut } from 'next-auth/react';
import { useQuoteStore } from '@/store/quoteStore';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const quoteCount = useQuoteStore((s) => s.getItemCount());
  const { data: session, status } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const skipNextDebounce = useRef(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const pathMatch = pathname.match(/^\/shop\/category\/([^/]+)/);
    const urlCategory = pathMatch ? pathMatch[1] : searchParams.get('category') || '';

    skipNextDebounce.current = true;
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }

    const t = setTimeout(() => {
      const trimmed = search.trim();
      const currentSearch = searchParams.get('search') || '';
      if (trimmed === currentSearch) return;
      if (search.length > 0 && trimmed === '') return;

      const p = new URLSearchParams(searchParams.toString());
      p.delete('category');
      if (trimmed.length > 0) p.set('search', trimmed);
      else p.delete('search');

      const base = category ? `/shop/category/${category}` : '/shop';
      const qs = p.toString();
      router.push(`${base}${qs ? `?${qs}` : ''}`, { scroll: false });
    }, 600);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCat = (v) => {
    setCategory(v);
    const p = new URLSearchParams(searchParams.toString());
    p.delete('category');
    const qs = p.toString();
    const dest = v ? `/shop/category/${v}${qs ? `?${qs}` : ''}` : `/shop${qs ? `?${qs}` : ''}`;
    router.push(dest, { scroll: false });
  };

  const submitSearch = () => {
    const p = new URLSearchParams();
    if (search.trim()) p.set('search', search.trim());
    const base = category ? `/shop/category/${category}` : '/shop';
    const qs = p.toString();
    router.push(`${base}${qs ? `?${qs}` : ''}`);
  };

  const getGreeting = () => {
    if (session?.user?.name) {
      return `Hello, ${session.user.name.split(' ')[0]}`;
    }
    return 'Hello, Sign in';
  };

  return (
    <div className="sticky top-0 z-50 w-full font-sans">
      {/* TOP BAR */}
      <div className="bg-[#131921] min-h-[60px] flex items-center py-1">
        <div className="w-full max-w-[1500px] mx-auto h-full flex items-center px-3 lg:px-4 gap-1 md:gap-2 lg:gap-3">
          <Link
            href="/"
            className="shrink-0 flex items-center h-[50px] px-1 border border-transparent hover:border hover:border-white rounded-sm transition-all duration-200"
          >
            <div className="bg-white rounded-sm h-[36px] px-3 flex items-center shadow-sm">
              <Image 
                src="/logo.png" 
                alt="SUMA" 
                width={120} 
                height={36} 
                className="h-[26px] w-auto object-contain" 
                priority 
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm cursor-pointer shrink-0 transition-all duration-200">
            <span className="text-white text-lg mt-[-8px]">📍</span>
            <div className="ml-1 leading-tight text-white">
              <div className="text-[11px] text-[#ccc] leading-none">Deliver to</div>
              <div className="text-sm font-bold leading-tight">Sri Lanka</div>
            </div>
          </div>

          <div className="flex flex-1 h-[40px] rounded-md overflow-hidden bg-white mx-1 md:mx-2 min-w-0 transition-all duration-200">
            <select
              value={category}
              onChange={(e) => handleCat(e.target.value)}
              aria-label="Search category"
              className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#555] text-xs px-2 w-[44px] md:w-[120px] border-r border-[#cdcdcd] outline-none cursor-pointer shrink-0 transition-colors duration-200"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="Search Suma Automation"
              aria-label="Search products"
              className="flex-1 min-w-0 px-3 text-sm text-black outline-none placeholder:text-[#6f7377]"
            />
            <button
              onClick={submitSearch}
              aria-label="Submit search"
              className="w-[45px] bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center shrink-0 transition-colors duration-200 border-l border-[#cdcdcd]"
            >
              <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center shrink-0 gap-1 md:gap-2">
            <div className="hidden lg:flex items-center h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm cursor-pointer transition-all duration-200">
              <span className="text-white text-sm font-bold">🇱🇰</span>
              <span className="text-white text-sm ml-1">EN</span>
            </div>

            <div className="hidden lg:flex flex-col h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm cursor-pointer transition-all duration-200">
              <span className="text-[11px] text-[#ccc] leading-none">
                {status === 'loading' ? 'Loading...' : getGreeting()}
              </span>
              <span className="text-sm font-bold text-white leading-tight">
                {session ? 'Account & Lists' : 'Account'}
              </span>
            </div>

            <Link
              href="/orders"
              className="hidden lg:flex flex-col h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm transition-all duration-200"
            >
              <span className="text-[11px] text-[#ccc] leading-none">Returns</span>
              <span className="text-sm font-bold text-white leading-tight">& Orders</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm transition-all duration-200 text-white"
            >
              <div className="relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {hasHydrated && itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#f08804] text-black text-xs font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-[#131921]">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-bold text-sm ml-1 self-end mb-1">Cart</span>
            </Link>

            <Link
              href="/quote-cart"
              className="relative flex items-center h-[50px] px-2 border border-transparent hover:border hover:border-white rounded-sm transition-all duration-200 text-white"
            >
              <div className="relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {hasHydrated && quoteCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#f08804] text-black text-xs font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-[#131921]">
                    {quoteCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-bold text-sm ml-1 self-end mb-1">Quote</span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
              className="lg:hidden text-white p-2 text-2xl ml-1 hover:bg-white/10 rounded"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECOND BAR - Courses ekata mulata */}
      <div className="bg-[#232f3e] min-h-[39px] flex items-center px-3 lg:px-4">
        <div className="w-full max-w-[1500px] mx-auto flex items-center gap-3 text-white text-[13px] overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="flex items-center gap-1 font-bold shrink-0 h-[30px] px-1 border border-transparent hover:border hover:border-white rounded-sm transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All
          </button>

          <Link
            href="/courses"
            className="bg-[#febd69] text-black h-[28px] px-3 rounded-sm font-bold text-[13px] flex items-center shrink-0 hover:bg-[#f3a847] transition-colors duration-200"
          >
            🎓 Courses
          </Link>

          <Link
            href="/shop"
            className="border border-transparent hover:border hover:border-white px-2 h-[30px] flex items-center shrink-0 rounded-sm transition-all duration-200 font-medium"
          >
            Today's Deals
          </Link>

          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/shop/category/${c.slug}`}
              className="border border-transparent hover:border hover:border-white px-2 h-[30px] flex items-center shrink-0 rounded-sm transition-all duration-200 whitespace-nowrap"
            >
              {c.name}
            </Link>
          ))}

          {categories.length > 6 && (
            <Link
              href="/shop"
              className="border border-transparent hover:border hover:border-white px-2 h-[30px] flex items-center shrink-0 rounded-sm transition-all duration-200"
            >
              More...
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[320px] bg-white z-[201] flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="bg-[#131921] text-white p-4 flex items-center justify-between min-h-[60px]">
              <div>
                <div className="text-xs text-[#ccc]">Hello</div>
                <div className="font-bold text-lg">
                  {session?.user?.name || 'Sign in'}
                </div>
              </div>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="text-2xl hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!session && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 border-b text-sm font-bold text-[#2b7fff] hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="mr-2">🔑</span>
                  Sign In
                </Link>
              )}
              <Link
                href="/courses"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 border-b text-sm font-bold text-black hover:bg-gray-50 transition-colors duration-200 bg-[#febd69]/10"
              >
                <span className="mr-2">🎓</span>
                Online Courses
              </Link>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 border-b text-sm text-black hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="mr-2">🏷️</span>
                Today's Deals
              </Link>
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Shop Categories
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop/category/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 border-b text-sm text-black hover:bg-gray-50 hover:pl-6 transition-all duration-200"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              {session && (
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="block w-full text-left px-4 py-3 border-t text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium mt-2"
                >
                  <span className="mr-2">🚪</span>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}