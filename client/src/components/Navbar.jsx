import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      setIsScrolled(currentY > 20);

      // Always show at the top of the page
      if (currentY <= 60) {
        setIsVisible(true);
      } else if (delta > 6) {
        // Scrolling down -> slide out/hide
        setIsVisible(false);
      } else if (delta < -6) {
        // Scrolling up -> slide in/show
        setIsVisible(true);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* WCAG 2.2 Skip to content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-50 w-full bg-[#8617d0]/95 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ease-out will-change-transform ${
          isScrolled ? 'shadow-xl' : ''
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Clean Brand Logo */}
          <Link
            to="/"
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-white rounded-md px-1 py-1"
            aria-label="Summitra Homepage"
          >
            Summitra
          </Link>

          {/* Right Section: Contact details & Buy Ticket Button */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Contact details */}
            <div className="hidden sm:flex flex-col text-right text-xs leading-snug text-white/90 font-medium">
              <a
                href="tel:8881234567"
                className="hover:text-white transition-colors"
              >
                (888) 123 4567
              </a>
              <a
                href="mailto:info@example.com"
                className="text-white/75 hover:text-white transition-colors text-[11px]"
              >
                info@example.com
              </a>
            </div>

            {/* Signature Webflow Pill CTA */}
            <Link
              to="/events"
              className="inline-flex items-center gap-2.5 pl-5 pr-2 py-2 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-100 transition-all duration-200 group shadow-lg"
            >
              <span>Buy Ticket</span>
              <span className="w-7 h-7 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform duration-200">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
