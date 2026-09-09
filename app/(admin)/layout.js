import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { redirect } from 'next/navigation';

export default function AdminGroupLayout({ children }) {
  // proxy eken protect karala thiyenawa, meka extra check ekak witharai
  return <>{children}</>;
}