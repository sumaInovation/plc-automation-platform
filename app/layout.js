import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/layout/AuthProvider';
import NavbarWrapper from './NavbarWrapper';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

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
  metadataBase: new URL('https://www.sumaautomation.lk'),
  title: {
    default: "Suma Automation",
    template: "%s | Suma Automation",
  },
  description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
openGraph: {
    title: "Suma Automation",
    description: "PLC & Automation components, training for university students and professionals — Sri Lanka",
    url: "https://www.sumaautomation.lk",
    siteName: "Suma Automation",
    type: "website",
    images: [
      {
        url: "/og-default.jpg", // meka public eke thiyena eka
        width: 1200,
        height: 630,
        alt: "Suma Automation"
      }
    ]

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
// Server-side categories fetch
async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find()
      .sort({ priority: 1, order: 1 })
      .select('name slug priority order')
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  const schema = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "Suma Automation",
    "image": "https://www.sumaautomation.lk/logo-desktop.svg",
    "url": "https://www.sumaautomation.lk",
    "telephone": "+94787556865",
    "email": "info@sumaautomation.lk",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ganemulla",
      "addressRegion": "Western Province",
      "addressCountry": "LK"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://web.facebook.com/profile.php?id=61584817932640",
      "https://www.youtube.com/@sumaautomationlk",
      "https://wa.me/94787556865"
    ]
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#F4F6F7] text-[#10161C]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <AuthProvider>
          <Suspense fallback={<div className="h-[64px] sm:h-[102px] bg-[#131921]" />}>
            <NavbarWrapper categories={categories} />
          </Suspense>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}