'use client';

import { useState } from 'react';

// Accepts 07XXXXXXXX, +947XXXXXXXX, 947XXXXXXXX
const LK_MOBILE_REGEX = /^(?:\+?94|0)7\d{8}$/;

const TEXT = {
  en: {
    openButton: '📱 Notify me about new workshops & batches',
    heading: 'Get a WhatsApp message when new courses open',
    namePlaceholder: 'Your name',
    numberPlaceholder: 'WhatsApp number (e.g. 07XXXXXXXX)',
    numberLabel: 'WhatsApp number',
    submit: 'Notify Me',
    loading: 'Submitting...',
    success: "✓ Thanks! We'll notify you on WhatsApp when new batches open.",
    invalidNumber: 'Please enter a valid Sri Lankan mobile number (e.g. 07XXXXXXXX).',
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection and try again.',
  },
  si: {
    openButton: '📱 අලුත් workshop සහ batch ගැන මට දැනුම් දෙන්න',
    heading: 'අලුත් පාඨමාලා ආරම්භ වෙද්දී WhatsApp message එකක් ලබාගන්න',
    namePlaceholder: 'ඔබේ නම',
    numberPlaceholder: 'WhatsApp අංකය (උදා: 07XXXXXXXX)',
    numberLabel: 'WhatsApp අංකය',
    submit: 'දැනුම් දෙන්න',
    loading: 'යවමින්...',
    success: '✓ ස්තූතියි! අලුත් batch ආරම්භ වූ විට WhatsApp හරහා දැනුම් දෙන්නම්.',
    invalidNumber: 'කරුණාකර නිවැරදි ශ්‍රී ලාංකික ජංගම අංකයක් ඇතුළත් කරන්න (උදා: 07XXXXXXXX).',
    generic: 'යම් දෙයක් වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.',
    network: 'ජාල දෝෂයක්. ඔබේ සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.',
  },
};

export default function NotifySubscribeForm({ defaultOpen = false, source, lang = 'en' }) {
  const t = TEXT[lang] ?? TEXT.en;

  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNumber = number.replace(/[\s-]/g, '');

    if (!LK_MOBILE_REGEX.test(cleanNumber)) {
      setError(t.invalidNumber);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsappNumber: cleanNumber,
          interestedIn: 'PLC & Robotics courses',
          source,
          website,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // response was not JSON
      }

      if (!res.ok || !data?.success) {
        // Server messages are English, so use the localized text for Sinhala
        setError(lang === 'si' ? t.generic : data?.error || t.generic);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t.network);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="border border-green-200 bg-green-50 rounded-lg p-4 text-center text-sm text-green-800"
      >
        {t.success}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="w-full text-sm font-medium text-[#2C6E9E] flex items-center justify-center gap-2"
        >
          {t.openButton}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-sm font-medium mb-2">{t.heading}</p>

          <input
            type="text"
            placeholder={t.namePlaceholder}
            aria-label={t.namePlaceholder}
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />

          <input
            type="tel"
            placeholder={t.numberPlaceholder}
            aria-label={t.numberLabel}
            autoComplete="tel"
            inputMode="tel"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full border p-2 rounded text-sm"
          />

          {/* Honeypot: hidden from real users */}
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}
          >
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="text-red-500 text-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C6E9E] text-white py-2 rounded text-sm font-medium hover:bg-[#245a80] disabled:bg-gray-300"
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>
      )}
    </div>
  );
}