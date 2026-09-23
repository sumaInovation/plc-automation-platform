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
    if (!containerRef.current ||!html) return;
    const el = containerRef.current;
    const shadow = el.shadowRoot || el.attachShadow({ mode: 'open' });

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Styles tika aran :root -> :host, body -> #root kiyala convert karanawa
      let allStyles = '';
      doc.querySelectorAll('style').forEach(styleTag => {
        let css = styleTag.innerHTML;
        css = css
         .replace(/:root/g, ':host')
         .replace(/\bhtml\b/g, ':host')
         .replace(/\bbody\b/g, '#syllabus-root')
         .replace(/\.wrap/g, '#syllabus-root');
        allStyles += css + '\n';
      });

      // 2. Body content eka gannawa - #course-syllabus-content thiyanawanam eka, nathnam body
      const contentEl = doc.getElementById('course-syllabus-content') || doc.body;
      let bodyHtml = contentEl? contentEl.innerHTML : html;

      // Cloudinary eke thibba topbar, hero wage ewath ain karala syllabus witharak gannawa nam
      // hero eka thiyenawanam ain karanna epa nam me line eka comment karapan
      // bodyHtml = bodyHtml.replace(/<header[\s\S]*?<\/header>/gi, '');

     shadow.innerHTML = `
  <style>
    :host { display: block; background: #fff; }
    #syllabus-root {
      max-width: 100%;
      margin: 0;
      padding: 28px 24px 30px 28px; /* left padding 28px kala */
      background: #fff;
      color: #0f1111;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    }
    ${allStyles}
    /* wrap eke padding ain karapu eka ain kala */
    #syllabus-root.wrap { max-width: 100%!important; }
    /* card eke left eka wadi karala */
    .card-body { padding-left: 68px!important; }
    @media(max-width:600px){
      #syllabus-root { padding: 20px 16px 24px 18px!important; }
      .card-body { padding-left: 16px!important; }
    }
  </style>
  <div id="syllabus-root">${bodyHtml}</div>
`;

      // details toggle eka Shadow DOM eke wada karanna
      shadow.querySelectorAll('details').forEach(d => {
        d.querySelector('summary')?.addEventListener('click', (e) => {
          // default behavior eka thiyenawa
        });
      });

    } catch (err) {
      shadow.innerHTML = `<div style="padding:20px;color:red">Failed to parse syllabus</div>`;
    }

    return () => { shadow.innerHTML = ''; };
  }, [html]);

  return <div ref={containerRef} className="w-full bg-white" />;
}

export default function SyllabusSection({ syllabus, syllabusFile }) {
  const [showFull, setShowFull] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  const hasSyllabusText = syllabus && syllabus.length > 0;

  useEffect(() => {
    if (!showFull ||!syllabusFile || htmlContent) return;
    setLoading(true);
    fetch(viewableUrl(syllabusFile))
     .then(r => r.text())
     .then(setHtmlContent)
     .catch(() => setHtmlContent('<p>Failed to load</p>'))
     .finally(() => setLoading(false));
  }, [showFull, syllabusFile, htmlContent]);

  if (!hasSyllabusText &&!syllabusFile) return null;

  return (
    <div className="border border-[#e7e7e7] rounded-lg overflow-hidden mb-6 bg-white">
      <div className="flex items-center justify-between px-5 py-4 bg-[#fafafa] border-b border-[#e7e7e7]">
        <h2 className="font-bold text-[#0f1111] flex items-center gap-2">
          <span className="w-1 h-5 bg-[#ff9900] rounded-full"></span>
          <span className="text-[#ff9900]">Syllabus</span>
        </h2>
        {syllabusFile && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#0f1111] text-white hover:bg-black transition"
          >
            {showFull? 'Hide Syllabus' : 'View Full Syllabus'}
          </button>
        )}
      </div>

      <div>
        {hasSyllabusText &&!showFull && (
          <ul className="p-5 space-y-2">
            {syllabus.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#0f1111]">
                <span className="text-[#067d62]">✓</span>
                <span>{typeof item === 'string'? item : item?.title || ''}</span>
              </li>
            ))}
          </ul>
        )}

        {showFull && (
          <div className="bg-white max-h- min-h- overflow-y-auto custom-scrollbar">
            {loading? (
              <div className="p-10 text-center text-sm text-[#565959]">Loading syllabus...</div>
            ) : (
              <IsolatedHtmlPreview html={htmlContent} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}