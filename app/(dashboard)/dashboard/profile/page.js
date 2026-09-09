'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div className="p-8">Loading...</div>;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p>Please login</p>
        <Link href="/login" className="text-blue-600 underline">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#131921] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {session.user.name?.[0] || 'U'}
          </div>
          <div>
            <div className="text-xl font-bold">{session.user.name}</div>
            <div className="text-sm text-gray-500">{session.user.email}</div>
            <div className="text-xs mt-1 px-2 py-0.5 bg-green-100 text-green-600 rounded-full inline-block">{session.user.role || 'user'}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div><label className="text-sm text-gray-500">Name</label><div className="font-medium">{session.user.name}</div></div>
          <div><label className="text-sm text-gray-500">Email</label><div className="font-medium">{session.user.email}</div></div>
        </div>

        <button onClick={()=>signOut({callbackUrl:'/'})} className="mt-6 w-full bg-red-50 text-red-600 py-2 rounded font-bold">Sign Out</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/dashboard/orders" className="bg-white border p-4 rounded-xl">📦 My Orders</Link>
        <Link href="/dashboard" className="bg-white border p-4 rounded-xl">🏠 Dashboard</Link>
      </div>
    </div>
  );
}