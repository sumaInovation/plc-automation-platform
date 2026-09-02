'use client';

import { useState, useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getCanShareSnapshot() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

function getServerSnapshot() {
  return false;
}

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(subscribe, getCanShareSnapshot, getServerSnapshot);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const whatsappLink = `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      // User cancel කලොත්, silently ignore කරනවා
    }
  };

  if (canNativeShare) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Share:</span>
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0-3 3v.2M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 0a3 3 0 0 1 2.83 2M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-9.17-2a3 3 0 0 1 0-4M8.83 8a3 3 0 0 1 6.34 0M8.83 16a3 3 0 0 0 6.34 0" />
          </svg>
          Share
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Share:</span>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
        title="Share on WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.14 8.14 0 0 1-1.25-4.37c0-4.51 3.67-8.18 8.19-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.52-3.67 8.24-8.08 8.24z" />
        </svg>
      </a>

      <a
        href={facebookLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
        </svg>
      </a>

      <button
        onClick={handleCopy}
        className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
        title="Copy link"
      >
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  );
}