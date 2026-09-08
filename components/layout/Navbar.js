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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    setIsSearchOpen(false);
  };

  const getGreeting = () => {
    if (session?.user?.name) {
      return `Hello, ${session.user.name.split(' ')[0]}`;
    }
    return 'Hello, Sign in';
  };

  return (
    <div className="sticky top-0 z-50 w-full font-sans">
      {/* TOP BAR - Amazon Mobile Style */}
      <div className="bg-[#131921] min-h-[48px] flex items-center px-2">
        <div className="w-full flex items-center gap-2">
          
          {/* Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1.5 hover:bg-white/10 rounded"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <div className="bg-white rounded-sm h-[30px] px-2 flex items-center">
              <Image 
                src="/logo.png" 
                alt="SUMA" 
                width={70} 
                height={20} 
                className="h-[18px] w-auto object-contain" 
                priority 
              />
            </div>
          </Link>

          {/* Search Bar */}
          {isSearchOpen ? (
            <div className="flex-1 flex h-[34px] rounded-md overflow-hidden bg-white">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                placeholder="Search products..."
                autoFocus
                className="flex-1 px-3 text-sm text-black outline-none placeholder:text-gray-400"
              />
              <button
                onClick={submitSearch}
                className="w-[36px] bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          ) : (
            /* Search Icon */
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-white p-1.5 hover:bg-white/10 rounded ml-auto"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Cart - Simple Icon with Badge */}
          <Link href="/cart" className="relative flex items-center text-white px-1">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#f08804] text-black text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border-2 border-[#131921]">
                  {itemCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* SECOND BAR - Simple Amazon Style with All, Courses, Today's Deals */}
      <div className="bg-[#232f3e] min-h-[36px] flex items-center px-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 text-white text-xs whitespace-nowrap">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="flex items-center gap-1 font-bold hover:opacity-80"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All
          </button>
          
          <Link 
            href="/courses" 
            className="bg-[#febd69] text-black px-3 py-0.5 rounded-sm font-bold text-[11px] hover:bg-[#f3a847] transition-colors"
          >
            🎓 Courses
          </Link>
          
          <Link 
            href="/shop" 
            className="hover:underline font-medium"
          >
            Today's Deals
          </Link>

          {/* Additional items for larger screens */}
          <Link href="/shop" className="hover:underline hidden sm:inline">Customer Service</Link>
          <Link href="/shop" className="hover:underline hidden sm:inline">Gift Cards</Link>
          
          {categories.slice(0, 3).map((c) => (
            <Link 
              key={c.slug} 
              href={`/shop/category/${c.slug}`} 
              className="hover:underline hidden md:inline"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE DRAWER - Clean Amazon Style */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[200]" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[280px] bg-white z-[201] flex flex-col shadow-2xl transition-transform duration-300">
            {/* Drawer Header */}
            <div className="bg-[#131921] text-white p-4 flex items-center gap-3 min-h-[50px]">
              <div className="w-8 h-8 bg-[#febd69] rounded-full flex items-center justify-center text-black font-bold text-sm">
                {session?.user?.name?.[0] || 'G'}
              </div>
              <div>
                <div className="text-[10px] text-[#ccc]">Hello</div>
                <div className="font-bold text-sm">
                  {session?.user?.name || 'Guest'}
                </div>
              </div>
            </div>

            {/* Drawer Menu Items */}
            <div className="flex-1 overflow-y-auto">
              {!session && (
                <Link 
                  href="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="block px-4 py-3 border-b text-sm font-bold text-[#2b7fff]"
                >
                  🔑 Sign In
                </Link>
              )}
              
              <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🏠 Home
              </Link>
              
              <Link 
                href="/courses" 
                onClick={() => setMenuOpen(false)} 
                className="block px-4 py-3 border-b text-sm text-black bg-[#febd69]/10 font-bold"
              >
                🎓 Online Courses
              </Link>
              
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🛍️ Shop All
              </Link>
              
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🔥 Today's Deals
              </Link>
              
              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Categories
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop/category/${c.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 border-b text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              
              {session && (
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="block w-full text-left px-4 py-3 border-t text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  🚪 Sign Out
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}