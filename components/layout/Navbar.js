'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useHasHydrated } from '@/hooks/useHasHydrated';

export default function Navbar() {
  const hasHydrated = useHasHydrated();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">PLC Automation</Link>

        <div className="flex gap-6 items-center">
          <Link href="/shop">Shop</Link>
          <Link href="/courses">Courses</Link>
          <Link href="/cart" className="relative">
            🛒 Cart
            {hasHydrated && itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </nav>
  );
}