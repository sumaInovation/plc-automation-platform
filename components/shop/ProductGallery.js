'use client';

import { useState, useRef } from 'react';

export default function ProductGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const imgRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-[#f7f8f8] rounded-[20px] flex flex-col items-center justify-center border border-dashed border-[#d5d9d9]">
        <div className="w-14 h-14 rounded-full bg-[#f0f2f2] flex items-center justify-center text-xl">📷</div>
        <span className="text-[#565959] text-sm mt-3 font-medium">No image available</span>
      </div>
    );
  }

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const activeImage = images[activeIndex];

  return (
    <>
      {/* Main Layout - Desktop: thumbnails left, image right */}
      <div className="flex flex-col-reverse lg:flex-row gap-3">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:w-[84px] lg:max-h-[520px] scrollbar-thin shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 w-[72px] h-[72px] lg:w-[76px] lg:h-[76px] rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? 'border-[#e77600] shadow-[0_0_0_3px_rgba(228,121,17,0.3)]'
                    : 'border-[#e7e7e7] hover:border-[#d5d9d9] bg-white'
                }`}
              >
                <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
                {i === activeIndex && (
                  <div className="absolute inset-0 bg-[#ffa41c]/10" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="flex-1">
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={() => setLightbox(true)}
            className="group relative aspect-square bg-white rounded-[20px] overflow-hidden border border-[#e7e7e7] cursor-zoom-in"
          >
            <img
              src={activeImage}
              alt={productName}
              className={`w-full h-full object-contain p-4 transition-transform duration-300 ${isZoomed ? 'scale-[1.7]' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-bold shadow-sm border border-[#e7e7e7] text-[#0f1111]">
                {activeIndex + 1} / {images.length}
              </span>
            </div>

            {/* Zoom hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#0f1111]/80 backdrop-blur text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5">
              <span>🔍</span> Click to expand • Hover to zoom
            </div>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-[#e7e7e7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-[#f0f2f2] text-[#0f1111]"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-[#e7e7e7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-[#f0f2f2] text-[#0f1111]"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Mobile thumbnails - dots style fallback */}
          <div className="flex lg:hidden justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-[#e77600]' : 'w-1.5 bg-[#d5d9d9]'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-medium">{productName} • {activeIndex + 1}/{images.length}</span>
            <button onClick={() => setLightbox(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl">×</button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <button
              onClick={() => setActiveIndex((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
            >‹</button>
            <img src={activeImage} alt={productName} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setActiveIndex((p) => (p + 1) % images.length)}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
            >›</button>
          </div>
          <div className="p-4 flex justify-center gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeIndex ? 'border-white' : 'border-white/20 opacity-60'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}