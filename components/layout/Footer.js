'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full font-sans mt-0">

      {/* MAIN LINKS - bg-[#232f3e] */}
      <div className="bg-[#232f3e] text-[#DDDDDD]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">

          <div>
            <h4 className="text-white font-bold text- mb-3">Shop Components</h4>
            <ul className="space-y-2 text-">
              <li><Link href="/shop?category=dev-board" className="hover:underline">Dev Board</Link></li>
              <li><Link href="/shop?category=plc" className="hover:underline">PLC & Modules</Link></li>
              <li><Link href="/shop?category=sensor" className="hover:underline">Sensors</Link></li>
              <li><Link href="/shop?category=module" className="hover:underline">Modules</Link></li>
              <li><Link href="/shop" className="hover:underline">All Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text- mb-3">Training</h4>
            <ul className="space-y-2 text-">
              <li><Link href="/courses" className="hover:underline">PLC Courses</Link></li>
              <li><Link href="/courses" className="hover:underline">Robotics Training</Link></li>
              <li><Link href="/about" className="hover:underline">For University Students</Link></li>
              <li><Link href="/about" className="hover:underline">For Working Engineers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text- mb-3">Suma Automation</h4>
            <ul className="space-y-2 text-">
              <li>✓ Island wide delivery</li>
              <li>✓ Real PLC hardware</li>
              <li>✓ Bank transfer accepted</li>
              <li className="mt-3 text-[#999] text-">Sri Lanka's automation store + hands-on training.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text- mb-3">Contact</h4>
            <ul className="space-y-2 text-">
              <li>WhatsApp: +94 78 755 6865</li>
              <li>info@sumaautomation.lk</li>
              <li>Mon - Sat: 9AM - 6PM</li>
            </ul>

            <div className="flex items-center gap-4 mt-4">
              <a href="https://web.facebook.com/profile.php?id=61584817932640" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#DDDDDD] hover:text-white transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.58v1.87h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
                </svg>
              </a>

              <a href="https://wa.me/94787556865" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-[#DDDDDD] hover:text-white transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.12h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.17 8.17 0 0 1 2.41 5.83c0 4.55-3.7 8.21-8.25 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01a.93.93 0 0 0-.67.31c-.23.24-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.13.16 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28Z"/>
                </svg>
              </a>

              <a href="https://www.youtube.com/@sumaautomationlk" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#DDDDDD] hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#3a4553] mt-2"></div>

        <div className="max-w-7xl mx-auto px-6 py-7 flex justify-center items-center gap-4">
          <Link href="/" className="text-white font-bold text-lg tracking-wide">SUMA AUTOMATION</Link>
        </div>
      </div>

      {/* BOTTOM - bg-[#131921] */}
      <div className="bg-[#131921] text-[#999] text-">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center">© {new Date().getFullYear()} Suma Automation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}