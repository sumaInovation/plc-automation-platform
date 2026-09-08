import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/layout/AuthProvider';
import dynamic from 'next/dynamic';

// Navbar eka dynamic import karanna (SSR off kara)
const Navbar = dynamic(
  () => import('@/components/layout/Navbar'),
  { ssr: false }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "Suma Automation",
  description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
  openGraph: {
    title: "Suma Automation",
    description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
    url: "https://sumaautomation.lk",
    siteName: "Suma Automation",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#F4F6F7] text-[#10161C]">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}