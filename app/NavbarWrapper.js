'use client';

import dynamic from 'next/dynamic';

// Import Navbar with SSR disabled in a Client Component
const Navbar = dynamic(
  () => import('@/components/layout/Navbar'),
  { ssr: false }
);

export default function NavbarWrapper() {
  return <Navbar />;
}