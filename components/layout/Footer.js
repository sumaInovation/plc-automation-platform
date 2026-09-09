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
              <li>WhatsApp: +94 XX XXX XXXX</li>
              <li>info@sumaautomation.lk</li>
              <li>Mon - Sat: 9AM - 6PM</li>
            </ul>
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