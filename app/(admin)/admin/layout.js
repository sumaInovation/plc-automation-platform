import Link from 'next/link';

const menu = [
  { href: '/admin', label: '🏠 Dashboard' },
  { href: '/admin/products', label: '📦 Products' },
  { href: '/admin/orders', label: '📋 Orders' },
  { href: '/admin/courses', label: '🎓 Courses' },
  { href: '/admin/batches', label: '👥 Batches' },
  { href: '/admin/enrollments', label: '📝 Enrollments' },
  { href: '/admin/quotations', label: '💬 Quotations' },
  { href: '/admin/subscribers', label: '📧 Subscribers' },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w- bg-[#131921] text-white p-4 hidden md:block">
        <h2 className="font-bold text-[#febd69] mb-6">SUMA ADMIN</h2>
        <nav className="space-y-1">
          {menu.map(m => (
            <Link key={m.href} href={m.href} className="block px-3 py-2 rounded hover:bg-white/10 text-">
              {m.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-[#f5f5f5] min-h-screen">{children}</main>
    </div>
  );
}