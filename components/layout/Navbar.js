'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { useSession, signOut } from 'next-auth/react';
import { useQuoteStore } from '@/store/quoteStore';

export default function Navbar({ categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { data: session, status } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const desktopSuggestionsRef = useRef(null);
  const isFirstRun = useRef(true);
  const skipNextDebounce = useRef(false);
  const lastPushedSearch = useRef(null);

  // ===== Load search from URL =====
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const pathMatch = pathname.match(/^\/shop\/category\/([^/]+)/);
    const urlCategory = pathMatch ? pathMatch[1] : searchParams.get('category') || '';

    if (lastPushedSearch.current !== null && urlSearch === lastPushedSearch.current) {
      lastPushedSearch.current = null;
      setCategory(urlCategory);
      return;
    }

    skipNextDebounce.current = true;
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [pathname, searchParams]);

  // ===== Auto-search on type =====
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const trimmed = search.trim();
      const currentSearch = searchParams.get('search') || '';

      if (trimmed === currentSearch) return;
      if (search.length > 0 && trimmed === '') return;

      const p = new URLSearchParams(searchParams.toString());
      p.delete('category');
      if (trimmed.length > 0) p.set('search', trimmed);
      else p.delete('search');

      lastPushedSearch.current = trimmed;
      const base = category ? `/shop/category/${category}` : '/shop';
      const qs = p.toString();
      router.push(`${base}${qs ? `?${qs}` : ''}`, { scroll: false });
    }, 600);

    return () => clearTimeout(timer);
  }, [search, category, searchParams, router]);

  // ===== Auto-suggest =====
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmed = search.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}&category=${category}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Suggest error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search, category]);

  // Close suggestions on outside click (covers both mobile + desktop inputs)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideMobile =
        (suggestionsRef.current && suggestionsRef.current.contains(e.target)) ||
        (searchInputRef.current && searchInputRef.current.contains(e.target));
      const insideDesktop =
        (desktopSuggestionsRef.current && desktopSuggestionsRef.current.contains(e.target)) ||
        (desktopSearchInputRef.current && desktopSearchInputRef.current.contains(e.target));

      if (!insideMobile && !insideDesktop) {
        setSuggestions([]);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    const p = new URLSearchParams(searchParams.toString());
    p.delete('category');
    const qs = p.toString();
    const dest = val ? `/shop/category/${val}${qs ? `?${qs}` : ''}` : `/shop${qs ? `?${qs}` : ''}`;
    router.push(dest, { scroll: false });
  };

  const submitSearch = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    setSuggestions([]);
    setIsSearchFocused(false);
    const p = new URLSearchParams();
    p.set('search', trimmed);
    const base = category ? `/shop/category/${category}` : '/shop';
    router.push(`${base}?${p.toString()}`);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.name);
    setSuggestions([]);
    setIsSearchFocused(false);
    const p = new URLSearchParams();
    p.set('search', suggestion.name);
    const base = category ? `/shop/category/${category}` : '/shop';
    router.push(`${base}?${p.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        submitSearch();
      }
      return;
    }

    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsSearchFocused(false);
    }
  };

  const getGreeting = () => {
    if (session?.user?.name) return session.user.name.split(' ')[0];
    return 'Sign in';
  };

  const SuggestionsList = ({ innerRef }) => (
    <div
      ref={innerRef}
      className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[360px] overflow-y-auto z-[100]"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion._id || index}
          onClick={() => handleSuggestionClick(suggestion)}
          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0 ${
            selectedIndex === index ? 'bg-gray-100' : ''
          }`}
        >
          {suggestion.image && (
            <img
              src={suggestion.image}
              alt={suggestion.name}
              className="w-10 h-10 object-contain rounded bg-gray-50 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-800 font-medium truncate">{suggestion.name}</div>
            {suggestion.category && (
              <div className="text-xs text-gray-500 truncate">{suggestion.category}</div>
            )}
          </div>
          {suggestion.price && (
            <div className="text-sm font-bold text-[#B12704] shrink-0">
              LKR {suggestion.price.toLocaleString()}
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="sticky top-0 z-50 w-full font-sans bg-[#131921]">
      {/* ===================== DESKTOP (sm and up) ===================== */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-4 px-4 h-[64px]">
          {/* Logo */}
<Link href="/" className="shrink-0 flex items-center max-w- overflow-hidden">
  <Image
    src="/logo-desktop.svg"
    alt="Suma"
    width={160}
    height={40}
    priority
    className="h- w-auto max-w-full object-contain"
  />
</Link>

          {/* Deliver to */}
          <button className="hidden md:flex flex-col justify-center text-white text-left px-2 py-1 rounded-sm hover:ring-1 hover:ring-white/40 shrink-0">
            <span className="flex items-center gap-1 text-[11px] text-gray-300 leading-none">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Deliver to
            </span>
            <span className="text-[13px] font-bold leading-tight">Sri Lanka</span>
          </button>

          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="flex h-[40px] rounded-md overflow-hidden ring-1 ring-transparent focus-within:ring-2 focus-within:ring-[#febd69]">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#555] text-[13px] px-2 w-[90px] border-r border-[#cdcdcd] outline-none cursor-pointer shrink-0"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>

              <input
                ref={desktopSearchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search products..."
                className="flex-1 min-w-0 px-3 text-[14px] text-black outline-none placeholder:text-gray-400 bg-white"
                autoComplete="off"
              />

              <button
                onClick={submitSearch}
                aria-label="Search"
                className="w-[48px] bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center shrink-0 transition-colors"
              >
                <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {isSearchFocused && suggestions.length > 0 && (
              <SuggestionsList innerRef={desktopSuggestionsRef} />
            )}
          </div>

          {/* Account & Lists */}
          <Link
            href={session ? '/dashboard' : '/login'}
            className="hidden md:flex flex-col justify-center text-white px-2 py-1 rounded-sm hover:ring-1 hover:ring-white/40 shrink-0"
          >
            <span className="text-[11px] text-gray-300 leading-none">Hello, {getGreeting()}</span>
            <span className="text-[13px] font-bold leading-tight">Account &amp; Lists</span>
          </Link>

          {/* Returns & Orders */}
          <Link
            href="/dashboard/orders"
            className="hidden lg:flex flex-col justify-center text-white px-2 py-1 rounded-sm hover:ring-1 hover:ring-white/40 shrink-0"
          >
            <span className="text-[11px] text-gray-300 leading-none">Returns</span>
            <span className="text-[13px] font-bold leading-tight">&amp; Orders</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="flex items-end gap-1 text-white px-2 py-1 rounded-sm hover:ring-1 hover:ring-white/40 shrink-0">
            <div className="relative">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1.5 left-3 text-[#f08804] text-[15px] font-bold">
                {hasHydrated ? itemCount : 0}
              </span>
            </div>
            <span className="text-[13px] font-bold hidden md:inline">Cart</span>
          </Link>
        </div>

        {/* Desktop second row — nav links */}
        <div className="bg-[#232f3e] h-[38px] flex items-center px-4 gap-5 text-white text-[13px] overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 font-bold hover:opacity-80 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All
          </button>


               {/* ADMIN LINK - admin ta witharai */}
  {session?.user?.role === 'admin' && (
    <Link href="/admin/products" className="bg-red-600 text-white px-2 py-0.5 rounded text-[12px] font-bold shrink-0">
      🛠 Admin
    </Link>
  )}


          <Link href="/courses" className="bg-[#febd69] text-black px-2 py-0.5 rounded text-[12px] font-bold shrink-0">
            🎓 Courses
          </Link>
          <Link href="/shop" className="hover:opacity-80 shrink-0">Today's Deals</Link>
          <Link href="/shop" className="hover:opacity-80 shrink-0">Products</Link>
          <Link href="/shop" className="hover:opacity-80 shrink-0">Livestreams</Link>
          <Link href="/shop" className="hover:opacity-80 shrink-0">Books</Link>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.slug} href={`/shop/category/${c.slug}`} className="hover:opacity-80 shrink-0">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ===================== MOBILE (below sm) ===================== */}
      <div className="sm:hidden">
        {/* Top bar */}
        <div className="min-h-[52px] flex items-center px-2 gap-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 -ml-1 hover:bg-white/10 rounded-sm shrink-0"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

  {/* MOBILE - eliyata panne na */}
<Link href="/" className="shrink-0 flex items-center max-w- overflow-hidden">
  <Image
    src="/logo-mobile.svg"
    alt="SUMA"
    width={120}
    height={28}
    priority
    className="h- w-auto max-w-full object-contain"
  />
</Link>

          <div className="flex-1 min-w-[8px]" />

          <Link href={session ? '/account' : '/login'} className="flex items-center gap-1.5 text-white px-1.5 py-1 hover:opacity-80 shrink-0">
            <span className="hidden xs:inline text-[13px] font-medium">{getGreeting()}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </Link>

          <Link href="/cart" className="relative flex items-center text-white px-1.5 shrink-0">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 text-[#f08804] text-[13px] font-bold">
                {hasHydrated ? itemCount : 0}
              </span>
            </div>
          </Link>
        </div>

        {/* Search bar */}
        <div className="px-2 pb-2.5 relative">
          <div className="flex h-[42px] rounded-md overflow-hidden bg-white ring-1 ring-black/5">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#555] text-base sm:text-[10px] px-1.5 w-[52px] sm:w-[70px] border-r border-[#cdcdcd] outline-none cursor-pointer shrink-0"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search products..."
              className="flex-1 min-w-0 px-3 text-base text-black outline-none placeholder:text-gray-400"
              autoComplete="off"
            />

            <button
              onClick={submitSearch}
              aria-label="Search"
              className="w-[44px] bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center shrink-0 transition-colors"
            >
              <svg className="w-4 h-4 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {isSearchFocused && suggestions.length > 0 && (
            <SuggestionsList innerRef={suggestionsRef} />
          )}
        </div>

        {/* Category links row */}
        <div className="bg-[#232f3e] min-h-[42px] flex items-center px-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 text-white text-[13px] whitespace-nowrap">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1.5 font-bold hover:opacity-80 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All
            </button>

            <Link href="/courses" className="bg-[#febd69] text-black px-2 py-0.5 rounded text-[12px] font-bold shrink-0">
              🎓 Courses
            </Link>
            <Link href="/shop" className="hover:opacity-80 shrink-0">Products</Link>
            <Link href="/shop" className="hidden xs:inline hover:opacity-80 shrink-0">Livestreams</Link>
            <Link href="/shop" className="hidden sm:inline hover:opacity-80 shrink-0">Books</Link>
          </div>
        </div>

        {/* Deliver to row */}
        <div className="bg-[#2b3a4c] min-h-[36px] flex items-center px-3 border-t border-[#3a4a5c]">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-200 hover:text-white transition-colors">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Deliver to Sri Lanka</span>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (shared) */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[200]" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[280px] bg-white z-[201] flex flex-col shadow-2xl transition-transform duration-300">
            <div className="bg-[#131921] text-white p-4 flex items-center gap-3 min-h-[50px]">
              <div className="w-8 h-8 bg-[#febd69] rounded-full flex items-center justify-center text-black font-bold text-sm">
                {session?.user?.name?.[0] || 'G'}
              </div>
              <div>
                <div className="text-[10px] text-[#ccc]">Hello</div>
                <div className="font-bold text-sm">{session?.user?.name || 'Guest'}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!session && (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm font-bold text-[#2b7fff]">
                  🔑 Sign In
                </Link>
              )}

              <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🏠 Home
              </Link>

              <Link href="/courses" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black bg-[#febd69]/10 font-bold">
                🎓 Online Courses
              </Link>

              <Link href="/shop" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🛍️ Shop All
              </Link>

              <Link href="/shop" onClick={() => setMenuOpen(false)} className="block px-4 py-3 border-b text-sm text-black">
                🔥 Today's Deals
              </Link>

              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Categories</div>
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