"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/categories')
     .then(r => r.json())
     .then(data => {
        const cats = Array.isArray(data)? data : data.categories || [];
        setCategories(cats);
      })
     .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (newCat) params.set('category', newCat);
    router.push(newCat? `/shop/category/${newCat}?${params.toString()}` : `/shop?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    router.push(category? `/shop/category/${category}?${params.toString()}` : `/shop?${params.toString()}`);
  };

  return (
    <>
      <div className="bg-[#131921] text-white">
        <div className="max-w- mx-auto flex items-center h- px-2 md:px-3 gap-2">
          <Link href="/" className="flex items-center shrink-0 px-1 md:px-2 py-1 border border-transparent hover:border-white">
            <img src="/logo.png" alt="SUMA" className="h-7 md:h-8 w-auto" />
            <span className="hidden lg:block font-bold text- ml-2 leading-none">SUMA<br/><span className="font-normal text-">AUTOMATION</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white cursor-pointer shrink-0">
            <span className="text-">📍</span>
            <div className="leading-[1.1]"><div className="text- text-[#ccc]">Deliver to</div><div className="text- font-bold">Sri Lanka</div></div>
          </div>
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 h- rounded- overflow-hidden bg-white focus-within:ring- focus-within:ring-[#f90] mx-2">
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#0f1111] text- px-3 pr-7 border-r border-[#cdcdcd] outline-none cursor-pointer max-w-">
              <option value="">All</option>
              {categories.map(cat => (<option key={cat.slug} value={cat.slug}>{cat.name}</option>))}
            </select>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, sku, plc, sensors..." className="flex-1 px-3 text- text-black outline-none" />
            <button type="submit" className="w- bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-[#131921]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
          </form>
          <div className="hidden md:flex items-center gap-1 shrink-0 ml-auto">
            <Link href="/courses" className="flex items-center gap-1.5 bg-[#232f3e] border border-[#febd69] hover:bg-[#febd69] hover:text-[#131921] text-[#febd69] px-3 py-1.5 rounded- text- font-bold mr-2">🎓 Courses</Link>
            <Link href="/quote" className="flex flex-col leading-[1.1] px-2 py-1 border border-transparent hover:border-white"><span className="text-">Quote</span><span className="text- font-bold">Requests</span></Link>
            <Link href="/cart" className="flex items-end gap-1 px-2 py-1 border border-transparent hover:border-white relative"><div className="relative"><span className="text- leading-none">🛒</span><span className="absolute -top-2 left-3 bg-[#131921] text-[#f08804] text- font-bold px-1">0</span></div><span className="text- font-bold">Cart</span></Link>
            <Link href="/login" className="bg-[#2b7fff] text-white px-4 py-1.5 rounded-full text- font-bold ml-2">Login</Link>
          </div>
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link href="/courses" className="bg-[#febd69] text-[#131921] px-3 py-1 rounded-full text- font-bold">Courses</Link>
            <Link href="/cart" className="relative px-1"><span className="text-">🛒</span><span className="absolute -top-1 -right-1 bg-[#f08804] text-black text- font-bold px-1 rounded-full">0</span></Link>
          </div>
        </div>
        <div className="md:hidden px-3 pb-3 bg-[#131921]">
          <form onSubmit={handleSearch} className="flex h- rounded- overflow-hidden bg-white">
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="bg-[#e6e6e6] text-[#0f1111] text- px-2 border-r border-[#ccc] outline-none max-w-"><option value="">All</option>{categories.map(cat => (<option key={cat.slug} value={cat.slug}>{cat.name}</option>))}</select>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products & courses..." className="flex-1 px-3 text- text-black outline-none" />
            <button type="submit" className="w- bg-[#febd69] flex items-center justify-center"><svg className="w-5 h-5 text-[#131921]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
          </form>
        </div>
      </div>
      <div className="bg-[#232f3e] text-white">
        <div className="max-w- mx-auto flex items-center h- px-2 gap-1 overflow-x-auto text- md:text- whitespace-nowrap">
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white shrink-0 font-bold bg-[#37475a] md:bg-transparent rounded"><span className="text-">☰</span> All</button>
          <Link href="/courses" className="flex items-center gap-1.5 bg-[#febd69] text-[#131921] font-bold px-3 py-1 rounded- hover:bg-[#f3a847] shrink-0 ml-1">🎓 Online Courses</Link>
          <div className="w-px h-5 bg-[#3a4553] mx-2 shrink-0 hidden md:block"></div>
          {categories.slice(0, 5).map(cat => (<Link key={cat.slug} href={`/shop/category/${cat.slug}`} className="px-2 py-1 border border-transparent hover:border-white shrink-0">{cat.name}</Link>))}
          <Link href="/shop" className="px-2 py-1 border border-transparent hover:border-white shrink-0">Today&apos;s Deals</Link>
        </div>
      </div>
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[200]" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w- md:w- bg-white z-[201] flex flex-col shadow-2xl">
            <div className="bg-[#232f3e] text-white h- flex items-center px-6 gap-2"><span className="text-">👤</span><span className="font-bold text-">Hello, Sign in</span><button onClick={() => setDrawerOpen(false)} className="ml-auto text- px-2">✕</button></div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 bg-[#fef8e7] border-b"><Link href="/courses" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-4 py-3 rounded-"><span className="flex items-center gap-2"><span className="text-">🎓</span> Browse All Online Courses</span><span>›</span></Link></div>
              <div className="p-2"><Link href="/shop" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-[#f0f2f2] rounded font-bold text- border-b"><span>🛒 All Products</span><span>›</span></Link></div>
              <div className="px-4 py-2"><h2 className="font-bold text- text-[#0f1111] mb-2">Shop by Department</h2><div className="space-y-0">{categories.map(cat => (<Link key={cat.slug} href={`/shop/category/${cat.slug}`} onClick={() => setDrawerOpen(false)} className="flex items-center justify-between px-2 py-3 hover:bg-[#f0f2f2] text- border-b border-[#eaeded]"><span>{cat.name}</span><span className="text-[#a6a6a6]">›</span></Link>))}</div></div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h- bg-[#131921]"></div>}>
      <NavbarContent />
    </Suspense>
  );
}