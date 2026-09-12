'use client';
import { useState, useEffect, useRef } from 'react';

function viewableUrl(url) {
  if (!url) return url;
  if (url.startsWith('https://res.cloudinary.com/')) {
    return `/api/courses/syllabus-view?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// Shadow DOM + Script execution
function IsolatedHtmlPreview({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;
    const el = containerRef.current;
    const shadow = el.shadowRoot || el.attachShadow({ mode: 'open' });

    // HTML + CSS එක set කරන්න
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        /* Shadow DOM එකේ default styles */
      </style>
      ${html}
    `;

    // ✅ Shadow DOM එකේ තියෙන <script> tags execute කරන්න
    const scripts = shadow.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      
      // Attributes copy කරන්න (type, src, etc.)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Inline content එක copy කරන්න
      newScript.textContent = oldScript.textContent;
      
      // Replace කරන්න - browser execute කරයි
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} />;
}

export default function SyllabusSection({ syllabus, syllabusFile }) {
  const [showFull, setShowFull] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  const isHtml = syllabusFile?.toLowerCase().includes('.html') || syllabusFile?.toLowerCase().includes('.htm');
  const hasSyllabusText = syllabus && syllabus.length > 0;

  useEffect(() => {
    if (!isHtml || !showFull || !syllabusFile || htmlContent) return;
    setLoading(true);
    fetch(viewableUrl(syllabusFile))
      .then(r => r.text())
      .then(setHtmlContent)
      .catch(() => setHtmlContent('<p>Failed to load</p>'))
      .finally(() => setLoading(false));
  }, [showFull, isHtml, syllabusFile, htmlContent]);

  if (!hasSyllabusText && !syllabusFile) return null;

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
            {showFull ? 'Hide' : 'View'}
          </button>
        )}
      </div>

      <div className="p-0">
        {hasSyllabusText && !showFull && (
          <ul className="p-5 space-y-2">
            {syllabus.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#0f1111]">
                <span className="text-[#067d62]">✓</span>
                <span>{typeof item === 'string' ? item : item?.title || ''}</span>
              </li>
            ))}
          </ul>
        )}

        {showFull && syllabusFile && (
          <div className="bg-white">
            {loading ? (
              <div className="p-10 text-center text-sm text-[#565959]">Loading syllabus...</div>
            ) : (
              <div className="max-h-[800px] overflow-y-auto custom-scrollbar p-0">
                {isHtml ? (
                  <IsolatedHtmlPreview html={htmlContent} />
                ) : (
                  <iframe src={viewableUrl(syllabusFile)} className="w-full h-[800px] border-0" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}