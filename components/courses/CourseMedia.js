'use client';

import { useState } from 'react';
import Image from 'next/image';

/** YouTube / Vimeo / direct file (mp4, webm, Cloudinary) support karanawa */
function parseVideo(url) {
  if (!url) return null;
  const u = url.trim();

  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) {
    return {
      type: 'iframe',
      id: yt[1],
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) {
    return { type: 'iframe', id: vm[1], src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1`, thumb: null };
  }

  return { type: 'file', src: u, thumb: null };
}

export default function CourseMedia({ image, video, title }) {
  const [playing, setPlaying] = useState(false);
  const media = parseVideo(video);

  const poster = image || media?.thumb || null;

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#e7e7e7] bg-[#f7f8f8]">
      {playing && media ? (
        media.type === 'iframe' ? (
          <iframe
            src={media.src}
            title={`${title} - introduction video`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            src={media.src}
            poster={poster || undefined}
            className="absolute inset-0 w-full h-full bg-black"
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )
      ) : (
        <>
          {/* Thumbnail */}
          {image ? (
            <Image
              src={image}
              alt={`${title} - PLC and Robotics course by Suma Automation`}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-contain"
              priority
            />
          ) : media?.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.thumb} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#f0f2f2] flex items-center justify-center text-xl">📷</div>
              <span className="text-[#565959] text-sm mt-3 font-medium">No image available</span>
            </div>
          )}

          {/* Play overlay */}
          {media && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play introduction video for ${title}`}
              className="group absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#007185]"
            >
              <span className="flex items-center gap-3 bg-white/95 text-[#0f1111] rounded-full pl-3 pr-5 py-2.5 shadow-lg group-hover:scale-105 transition-transform">
                <span className="w-10 h-10 rounded-full bg-[#ff9900] flex items-center justify-center">
                  <svg viewBox="0 0 20 20" className="w-4 h-4 ml-0.5 text-white" fill="currentColor" aria-hidden="true">
                    <path d="M6 4l11 6-11 6V4z" />
                  </svg>
                </span>
                <span className="text-sm font-bold">Watch intro</span>
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
