export const metadata = {
  title: 'Test OG Page',
  description: 'Testing WhatsApp preview',
  openGraph: {
    title: 'Test OG Page',
    description: 'Testing WhatsApp preview',
    url: 'https://www.sumaautomation.lk/test-og',
    siteName: 'Suma Automation',
    images: [
      {
        url: 'https://www.sumaautomation.lk/no-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
};

export default function TestOG() {
  return <div>Test page for OG preview</div>;
}