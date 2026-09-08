'use client';

import dynamic from 'next/dynamic';

// Navbar ekak dynamic import karanna (SSR off)
const Navbar = dynamic(
  () => import('@/components/layout/Navbar'),
  { ssr: false }
);

export default function NavbarWrapper({ categories }) {
  return <Navbar categories={categories} />;
}