import Link from 'next/link';
import { Noto_Sans_Sinhala } from 'next/font/google';
import NotifySubscribeForm from '@/components/courses/NotifySubscribeForm';

const sinhalaFont = Noto_Sans_Sinhala({ subsets: ['sinhala'], weight: ['400', '500', '600'] });

const SITE_URL = 'https://www.sumaautomation.lk';
const CLOUD_BASE = 'https://res.cloudinary.com/dei7i7oli/image/upload';

const OG_IMAGES = {
  en: `${CLOUD_BASE}/w_1200,h_630,c_fill,f_jpg,q_auto/v1790864989/og-notify-en.png`,
  si: `${CLOUD_BASE}/w_1200,h_630,c_fill,f_jpg,q_auto/v1790864988/og-notify-si.png`,
};

const CONTENT = {
  en: {
    title: 'Get notified about new PLC & Robotics batches',
    description:
      'Join our WhatsApp list and be the first to know when new workshops and batches open.',
    heading: 'New PLC & Robotics batches',
    intro: "Leave your WhatsApp number and we'll message you when registration opens.",
  },
  si: {
    title: 'අලුත් PLC සහ Robotics batch ගැන දැනගන්න',
    description: 'අලුත් workshop සහ batch ආරම්භ වෙද්දී WhatsApp එකෙන් මුලින්ම දැනගන්න.',
    heading: 'අලුත් PLC සහ Robotics batch',
    intro: 'ඔබේ WhatsApp අංකය දාන්න. ලියාපදිංචිය ආරම්භ වූ විගස අපි ඔබට message එකක් එවන්නම්.',
  },
};

function getLang(params) {
  return params?.lang === 'si' ? 'si' : 'en';
}


export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const lang = getLang(params);
  const c = CONTENT[lang];
  const image = OG_IMAGES[lang];

  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `${SITE_URL}/notify` },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `${SITE_URL}/notify`,
      siteName: 'Suma Automation',
      type: 'website',
      images: [{ url: image, secureUrl: image, width: 1200, height: 630, alt: c.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.title,
      description: c.description,
      images: [image],
    },
  };
}



export default async function NotifyPage({ searchParams }) {
  const params = await searchParams;
  const lang = getLang(params);
  const source = typeof params?.source === 'string' ? params.source : undefined;
  const c = CONTENT[lang];

  const linkFor = (l) => {
    const q = new URLSearchParams();
    if (source) q.set('source', source);
    q.set('lang', l);
    return `/notify?${q.toString()}`;
  };

  const activeClass = 'font-semibold text-[#2C6E9E] underline';
  const idleClass = 'text-slate-500 hover:text-[#2C6E9E]';

  return (
    <main className={`max-w-md mx-auto p-4 pt-10 ${lang === 'si' ? sinhalaFont.className : ''}`}>
      <div className="flex justify-end gap-3 text-sm mb-4">
        <Link href={linkFor('en')} className={lang === 'en' ? activeClass : idleClass}>
          English
        </Link>
        <Link href={linkFor('si')} className={lang === 'si' ? activeClass : idleClass}>
          සිංහල
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-2">{c.heading}</h1>
      <p className="text-sm text-slate-600 mb-4">{c.intro}</p>

      <NotifySubscribeForm defaultOpen source={source} lang={lang} />
    </main>
  );
}