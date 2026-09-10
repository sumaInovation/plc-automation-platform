import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/layout/AuthProvider';
import NavbarWrapper from './NavbarWrapper';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Footer from '@/components/layout/Footer';
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
  metadataBase: new URL("https://sumaautomation.lk"),
  title: {
    default: "Suma Automation",
    template: "%s | Suma Automation",
  },
  description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
  openGraph: {
    title: "Suma Automation",
    description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
    url: "https://sumaautomation.lk",
    siteName: "Suma Automation",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
// Server-side categories fetch
async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ name: 1 })
      .select('name slug')
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#F4F6F7] text-[#10161C]">
        <AuthProvider>
          <NavbarWrapper categories={categories} />
          {children}
            <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}