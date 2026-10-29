import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-[#8617d0] text-white pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 rounded-t-[40px] sm:rounded-t-[60px] lg:rounded-t-[80px] overflow-hidden mt-16 sm:mt-24">
      {/* Decorative Curved SVG Line Overlay matching Summitra Webflow */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 2355 1004"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M36.7591 997.712C66.2494 809.982 256.767 481.414 782.914 668.989C1309.06 856.564 1451.68 493.796 1516.82 314.529C1565.56 180.385 1819.23 -152.277 2334.34 182.969"
            stroke="white"
            strokeOpacity="0.12"
            strokeWidth="74"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Details Box: Left Logo & Subtitle | Right Date Tab & Tagline */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 sm:gap-12 pb-10 sm:pb-14">
          {/* Left Brand Details */}
          <div className="space-y-4 max-w-md">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6885d1d440e2aa5f9bd01a9f_Summitra.svg"
                alt="Summitra"
                className="h-8 sm:h-9 w-auto brightness-0 invert group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.currentTarget.classList.add('hidden');
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-extrabold text-3xl tracking-tight text-white">
                Summitra
              </span>
            </Link>
            <p className="text-sm sm:text-[15px] text-white/90 leading-relaxed max-w-[340px]">
              Thank you for exploring our world through the lens. From capturing cherished memories to unveiling the beauty of the everyday.
            </p>
          </div>

          {/* Right Date Pill & Giant Butter-Yellow Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 lg:gap-10">
            <div className="px-7 py-3 rounded-full border border-white/40 text-white text-base sm:text-lg font-normal tracking-tight whitespace-nowrap self-start sm:self-center select-none">
              August 20
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-[#fdda7a] tracking-tight leading-[1.08] max-w-[340px]">
                Largest 2025 IT
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-[#fdda7a] tracking-tight leading-[1.08] max-w-[340px]">
                Conference.
              </h2>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-white/20 my-6 sm:my-8" />

        {/* Bottom Link & Credits Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2 text-sm text-white/80">
          {/* Utility Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <Link
              to="/events"
              className="hover:text-white transition-colors"
            >
              Style guide
            </Link>
            <Link
              to="/events"
              className="px-2.5 py-1 rounded border border-white/50 text-white hover:bg-white/10 transition-colors"
            >
              Instructions
            </Link>
            <Link
              to="/events"
              className="hover:text-white transition-colors"
            >
              License
            </Link>
            <Link
              to="/events"
              className="hover:text-white transition-colors"
            >
              Changelog
            </Link>
            <Link
              to="/events"
              className="hover:text-white transition-colors"
            >
              404
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs font-medium ml-2 px-2 py-0.5 rounded bg-black/20 border border-white/10"
              title="Staff Operations Portal"
            >
              <Lock className="w-3 h-3 text-[#fdda7a]" />
              <span>Admin Portal</span>
            </Link>
          </div>

          {/* Credits */}
          <div className="text-sm text-white/70">
            Design by Summitra - Powered by{' '}
            <span className="text-white font-medium hover:underline cursor-pointer">
              Webflow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
