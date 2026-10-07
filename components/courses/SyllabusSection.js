'use client';
import { useState, useEffect, useRef } from 'react';

function viewableUrl(url) {
  if (!url) return url;
  if (url.startsWith('https://res.cloudinary.com/')) {
    return `/api/courses/syllabus-view?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function IsolatedHtmlPreview({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;
    const el = containerRef.current;
    const shadow = el.shadowRoot || el.attachShadow({ mode: 'open' });

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. :root -> :host, body -> #syllabus-root
      let allStyles = '';
      doc.querySelectorAll('style').forEach((styleTag) => {
        let css = styleTag.innerHTML;
        css = css
          .replace(/:root/g, ':host')
          .replace(/\bhtml\b/g, ':host')
          .replace(/\bbody\b/g, '#syllabus-root')
          .replace(/\.wrap/g, '#syllabus-root');
        allStyles += css + '\n';
      });

      // 2. #course-syllabus-content thiyenawanam eka, nathnam body
      const contentEl = doc.getElementById('course-syllabus-content') || doc.body;
      const bodyHtml = contentEl ? contentEl.innerHTML : html;

      shadow.innerHTML = `
        <style>
          :host { display: block; background: #fff; }
          #syllabus-root {
            max-width: 100%;
            margin: 0;
            padding: 28px 24px 30px 28px;
            background: #fff;
            color: #0f1111;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
          }
          ${allStyles}
          #syllabus-root.wrap { max-width: 100% !important; }
          .card-body { padding-left: 68px !important; }
          @media (max-width: 600px) {
            #syllabus-root { padding: 20px 16px 24px 18px !important; }
            .card-body { padding-left: 16px !important; }
          }
        </style>
        <div id="syllabus-root">${bodyHtml}</div>
      `;

      // Week accordions: kisima ekak open nethnam, palaweni ekak open karanawa
      const items = shadow.querySelectorAll('details');
      if (items.length && ![...items].some((d) => d.open)) {
        items[0].open = true;
      }
    } catch (err) {
      shadow.innerHTML = `<div style="padding:20px;color:#cc0c39">Failed to parse syllabus</div>`;
    }

    return () => {
      shadow.innerHTML = '';
    };
  }, [html]);

  return <div ref={containerRef} className="w-full bg-white" />;
}

export default function SyllabusSection({ syllabus, syllabusFile }) {
  // Default: full syllabus OPEN (file thiyenawanam)
  const [showFull, setShowFull] = useState(!!syllabusFile);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  const hasSyllabusText = Array.isArray(syllabus) && syllabus.length > 0;

  useEffect(() => {
    if (!showFull || !syllabusFile || htmlContent) return;
    let cancelled = false;
    setLoading(true);
    fetch(viewableUrl(syllabusFile))
      .then((r) => {
        if (!r.ok) throw new Error('Bad response');
        return r.text();
      })
      .then((t) => !cancelled && setHtmlContent(t))
      .catch(() => !cancelled && setHtmlContent('<p>Failed to load syllabus. Please try again.</p>'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [showFull, syllabusFile, htmlContent]);

  if (!hasSyllabusText && !syllabusFile) return null;

  return (
    <section className="border border-[#e7e7e7] rounded-xl overflow-hidden mb-8 bg-white" aria-labelledby="syllabus-heading">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-[#fafafa] border-b border-[#e7e7e7]">
        <h2 id="syllabus-heading" className="font-bold text-[#0f1111] flex items-center gap-2">
          <span className="w-1 h-5 bg-[#ff9900] rounded-full" aria-hidden="true" />
          Syllabus
        </h2>

        {syllabusFile && (
          <button
            type="button"
            onClick={() => setShowFull((v) => !v)}
            aria-expanded={showFull}
            aria-controls="syllabus-content"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full bg-[#0f1111] text-white hover:bg-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007185]"
          >
            {showFull ? 'Hide Syllabus' : 'View Full Syllabus'}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${showFull ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5 7l5 6 5-6H5z" />
            </svg>
          </button>
        )}
      </div>

      <div id="syllabus-content">
        {/* Short checklist - full syllabus close karoth witharak */}
        {hasSyllabusText && !showFull && (
          <ul className="p-4 sm:p-5 space-y-2.5">
            {syllabus.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-[#0f1111] leading-relaxed">
                <span className="text-[#067d62] shrink-0" aria-hidden="true">✓</span>
                <span>{typeof item === 'string' ? item : item?.title || ''}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Full syllabus (HTML file) */}
        {showFull && (
          <div className="bg-white min-h-[160px]">
            {loading ? (
              <div className="p-5 space-y-3 animate-pulse" aria-live="polite">
                <div className="h-4 w-1/3 bg-[#f0f2f2] rounded" />
                <div className="h-12 bg-[#f7f8f8] rounded-lg" />
                <div className="h-12 bg-[#f7f8f8] rounded-lg" />
                <div className="h-12 bg-[#f7f8f8] rounded-lg" />
                <span className="sr-only">Loading syllabus...</span>
              </div>
            ) : (
              <IsolatedHtmlPreview html={htmlContent} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
