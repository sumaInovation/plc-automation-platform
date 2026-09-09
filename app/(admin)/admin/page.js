import Link from 'next/link';

const adminLinks = [
  { href: '/admin/products', label: '📦 Products', desc: 'Manage shop products' },
  { href: '/admin/orders', label: '📋 Orders', desc: 'View customer orders' },
  { href: '/admin/courses', label: '🎓 Courses', desc: 'Manage courses' },
  { href: '/admin/batches', label: '👥 Batches', desc: 'Student batches' },
  { href: '/admin/enrollments', label: '📝 Enrollments', desc: 'Course enrollments' },
  { href: '/admin/quotations', label: '💬 Quotations', desc: 'Customer quotes' },
  { href: '/admin/categories', label: '📁 Categories', desc: 'Product categories' },
  { href: '/admin/subscribers', label: '📧 Subscribers', desc: 'Newsletter subscribers' },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">🛠 Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back! Manage your platform here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map(link => (
          <Link key={link.href} href={link.href} className="bg-white p-5 rounded-xl border hover:shadow-lg hover:border-black transition-all">
            <div className="text-xl font-bold">{link.label}</div>
            <div className="text-sm text-gray-500 mt-1">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
