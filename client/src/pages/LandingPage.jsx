import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { EventCard } from '../components/EventCard';
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Lock,
  Zap,
  QrCode,
  CheckCircle2,
  Sparkles,
  Flame,
  Calendar
} from 'lucide-react';

export function LandingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => api.getEvents({ limit: 3 })
  });

  const featuredEvents = data?.events || [];

  // Smooth scroll interpolation: side cards start 85px lower, glide up to 0px on scroll
  const { scrollY } = useScroll();
  const rawSideY = useTransform(scrollY, [0, 260], [85, 0]);
  const sideCardY = useSpring(rawSideY, { stiffness: 90, damping: 20, mass: 0.6 });

  // Live countdown timer targeting August 13
  const [timeLeft, setTimeLeft] = useState({
    days: 15,
    hours: 8,
    minutes: 30,
    seconds: 52
  });

  useEffect(() => {
    // Target date: August 13
    const targetDate = new Date('2026-08-13T09:00:00Z').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const speakers = [
    {
      name: 'Dr. Marcus Elwood',
      role: 'AI Scientist, NeuroCore Labs',
      bgColor: '#f5b041',
      img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/68807fe3fa2c3b7e74f497a7_f32842e72824373ee91071fc214bd16b_team-1.png'
    },
    {
      name: 'Jonathan Reyes',
      role: 'Head of Cloud Engineering',
      bgColor: '#529df8',
      img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891a86d98f9bef9d385160b_6880802c60e7f6881998217f_df20dfb4a6d3c10988d870b3dd6a4aa9_team-2%20(1).png'
    },
    {
      name: 'Daniel Kim',
      role: 'Founder & CTO, DevSync',
      bgColor: '#9f55e8',
      img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6880805b8393f4c37ca65a63_2a2f9f6f8a7271d304946ed306c7917c_team-3.png'
    },
    {
      name: 'Ahmed Faizal',
      role: 'Lead Cybersecurity Architect',
      bgColor: '#f76a58',
      img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891aac603a49c7db89b4af7_6880802c60e7f6881998217f_df20dfb4a6d3c10988d870b3dd6a4aa9_team-2%20(2).png'
    }
  ];

  return (
    <main id="main-content" className="overflow-hidden bg-black text-white">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Webflow Summitra Purple Wave Style) */}
      {/* ============================================================== */}
      <section className="relative bg-gradient-to-b from-[#8617d0] via-[#8617d0] to-[#7511b8] text-white pt-6 pb-32 sm:pb-48 lg:pb-56 rounded-b-[40px] sm:rounded-b-[60px] lg:rounded-b-[80px] overflow-hidden shadow-[0_20px_50px_rgba(134,23,208,0.35)]">
        {/* Subtle Decorative Flowing SVG Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1535 1061"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1707.93 -152.316C1764.23 29.1878 1738.08 408.094 1183.13 471.69C628.175 535.286 660.095 923.773 680.661 1113.39C696.051 1255.29 615.025 1665.71 4.8731 1591.9"
              stroke="white"
              strokeWidth="60"
            />
            <path
              d="M36.7591 997.712C66.2494 809.982 256.767 481.414 782.914 668.989C1309.06 856.564 1451.68 493.796 1516.82 314.529C1565.56 180.385 1819.23 -152.277 2334.34 182.969"
              stroke="white"
              strokeWidth="60"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Main Copy - Exact Webflow Specifications */}
          <div className="pt-8 sm:pt-12 pb-8 max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[96px] font-semibold tracking-tight text-[#fdda7a] leading-[1.08] sm:leading-[1.05]">
              Code. Connect. Create.
              <br />
              One Epic Conference
            </h1>

            {/* Exact Webflow Two-Tone Subtitle Box */}
            <div className="max-w-[506px] mx-auto mt-6 mb-8 text-center text-sm sm:text-base font-semibold leading-[1.62]">
              <span className="text-white">
                Explore our lineup of keynote speakers and industry{' '}
              </span>
              <span className="text-white/50">
                leaders who will inspire and enlighten at the conference.
              </span>
            </div>

            {/* Exact Webflow Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 pt-2">
              <Link
                to="/events"
                className="h-14 pl-7 pr-2.5 rounded-full bg-white text-[#040404] font-bold text-base hover:bg-zinc-100 transition-all duration-200 inline-flex items-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.2)] group"
              >
                <span>Buy Ticket</span>
                <span className="w-9 h-9 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Exact Webflow Location Badge */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-14 h-14 rounded-full bg-white/10 p-2 flex items-center justify-center flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-[#fdda7a] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-black fill-black" />
                  </div>
                </div>
                <span className="text-white text-sm sm:text-base font-normal">
                  Elgin Celina, Delaware
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 sm:-mt-14 lg:-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakers.map((sp, idx) => {
            const isSideCard = idx === 0 || idx === 3;
            return (
              <motion.div
                key={idx}
                className="group"
                style={{ y: isSideCard ? sideCardY : 0 }}
              >
                {/* Colored Portrait Card */}
                <div
                  style={{ backgroundColor: sp.bgColor }}
                  className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden relative flex items-end justify-center shadow-2xl transition-transform duration-300 group-hover:-translate-y-2"
                >
                  <img
                    src={sp.img}
                    alt={sp.name}
                    className="w-full h-full object-contain object-bottom select-none pointer-events-none transform transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Speaker Label - Exact Webflow Proportions */}
                <div className="pt-3.5 text-left">
                  <h3 className="text-base sm:text-lg xl:text-[18px] font-semibold text-white tracking-tight leading-snug">
                    {sp.name}
                  </h3>
                  <p className="text-xs sm:text-[12px] text-[#aeaeae] font-normal mt-1 leading-normal">
                    {sp.role}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ABOUT SECTION WITH COUNTDOWN (Exact Webflow Proportions) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24">
        <div className="max-w-[1160px] mx-auto">
          {/* Section Title */}
          <h2 className="text-5xl sm:text-6xl lg:text-[72px] font-semibold text-white tracking-tight leading-[1.17] capitalize">
            About
          </h2>

          {/* Large Editorial Statement */}
          <div className="mt-8 sm:mt-12 text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-medium leading-[1.29] tracking-[-0.03em]">
            <span className="text-white">
              Summitra 2025 is an immersive, IT Conference over the course of
              three days,{' '}
            </span>
            <span className="text-[#a278d9]">August 13-15.</span>
            <span className="text-white"> Our mission,</span>
            <span className="text-[#747070]">
              the challenges, A person's success is measured by the way they
              approach it and how they approach it.
            </span>
          </div>

          {/* Countdown Timer on Left & Buy Ticket on Right (Aligned to Bottom) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 mt-12 sm:mt-14">
            {/* 4 Dark Aspect-Ratio Countdown Boxes */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-3.5">
              <div className="w-20 h-20 sm:w-[126px] sm:h-[126px] aspect-square bg-[#111111] rounded-lg flex flex-col items-center justify-center">
                <div className="text-2xl sm:text-[40px] font-bold text-white leading-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-base text-[#a3a3a3] font-normal mt-0.5">
                  Days
                </div>
              </div>

              <div className="w-20 h-20 sm:w-[126px] sm:h-[126px] aspect-square bg-[#111111] rounded-lg flex flex-col items-center justify-center">
                <div className="text-2xl sm:text-[40px] font-bold text-white leading-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-base text-[#a3a3a3] font-normal mt-0.5">
                  Hours
                </div>
              </div>

              <div className="w-20 h-20 sm:w-[126px] sm:h-[126px] aspect-square bg-[#111111] rounded-lg flex flex-col items-center justify-center">
                <div className="text-2xl sm:text-[40px] font-bold text-white leading-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-base text-[#a3a3a3] font-normal mt-0.5">
                  Minutes
                </div>
              </div>

              <div className="w-20 h-20 sm:w-[126px] sm:h-[126px] aspect-square bg-[#111111] rounded-lg flex flex-col items-center justify-center">
                <div className="text-2xl sm:text-[40px] font-bold text-white leading-tight">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-base text-[#a3a3a3] font-normal mt-0.5">
                  Seconds
                </div>
              </div>
            </div>

            {/* Buy Ticket Pill Button - Positioned to the far right aligned to bottom */}
            <div className="self-end sm:self-auto">
              <Link
                to="/events"
                className="h-14 pl-7 pr-2.5 rounded-full bg-white text-[#040404] font-bold text-base hover:bg-zinc-100 transition-all duration-200 inline-flex items-center gap-3 shadow-xl group"
              >
                <span>Buy Ticket</span>
                <span className="w-9 h-9 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3.1 EXPANDING VIDEO SECTION (Expands to Full Width on Scroll) */}
      {/* ============================================================== */}
      <ExpandingVideoSection />

      {/* ============================================================== */}
      {/* 3.2 MEET ALL THE TOP IT MINDS SECTION */}
      {/* ============================================================== */}
      <MeetTopITMindsSection />

      {/* ============================================================== */}
      {/* 3.3 BRAND PARTNERS IN INNOVATION SECTION */}
      {/* ============================================================== */}
      <BrandPartnersSection />

      {/* ============================================================== */}
      {/* 4. FEATURED EVENTS & LIVE TICKETS (Smart Booking System) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-[#c084fc] mb-2">
              <Flame className="w-4 h-4 text-[#c084fc]" />
              <span>Real-Time Seat Feed</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Tech Summits
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#c084fc] hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            <span>View all upcoming events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <EventCard key={i} loading={true} />
              ))
            : featuredEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. ARCHITECTURAL PILLARS (Anti-Oversell Guarantee) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#c084fc] block">
            Engineered For Scale
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built on Mission-Critical Architecture
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Standard booking sites crumble during ticket drop spikes. Summitra
            solves overselling and race conditions at the database transaction layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-zinc-800 bg-[#0c0c10] hover:border-[#8617d0]/60 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#c084fc]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Row-Lock Concurrency Protection
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every booking runs inside an atomic SQL transaction with{' '}
                <code className="text-[#c084fc]">SELECT ... FOR UPDATE</code>.
                Parallel checkout requests queue deterministically so seats never
                drop below zero.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-800 text-xs text-[#c084fc] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified by Concurrency Stress Test
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-800 bg-[#0c0c10] hover:border-[#8617d0]/60 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#c084fc]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Sub-Second Socket.IO Sync
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Room-based WebSocket architecture emits immediate seat count deltas
                upon transaction commit. All open browsers update live without
                requiring manual page refresh.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-800 text-xs text-[#c084fc] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Auto-reconnect with fresh state
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-800 bg-[#0c0c10] hover:border-[#8617d0]/60 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#c084fc]">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Instant QR Verification & PNG Export
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Attendee tickets generate instant cryptographically verifiable QR
                codes directly on the client. Attendees can download high-resolution
                PNG passes for offline entry.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-800 text-xs text-[#c084fc] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Accessible text equivalent included
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION BANNER */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl border border-[#8617d0]/40 bg-gradient-to-r from-[#8617d0]/25 via-black to-[#8617d0]/25 p-10 sm:p-16 text-center overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Secure Your Pass?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Browse world-class technical summits, view interactive venue
              locations, and checkout with zero overselling guarantee.
            </p>
            <div className="pt-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-3 pl-7 pr-2.5 py-3 rounded-full bg-white text-black font-extrabold text-base hover:bg-zinc-100 transition-all duration-200 group shadow-xl"
              >
                <span>Browse All Events</span>
                <span className="w-10 h-10 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ExpandingVideoSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center']
  });

  // Simultaneous downward motion + size expansion with buttery smooth spring physics
  const rawScale = useTransform(scrollYProgress, [0.05, 0.95], [0.52, 1]);
  const rawY = useTransform(scrollYProgress, [0.05, 0.95], [-120, 40]);
  const rawRadius = useTransform(scrollYProgress, [0.05, 0.95], [36, 0]);

  const scale = useSpring(rawScale, { stiffness: 75, damping: 22, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 75, damping: 22, mass: 0.5 });
  const borderRadius = useSpring(rawRadius, { stiffness: 75, damping: 22, mass: 0.5 });

  return (
    <section
      ref={containerRef}
      className="relative w-full pt-8 pb-24 overflow-hidden flex justify-center items-center"
    >
      <motion.div
        style={{
          scale,
          y,
          borderRadius
        }}
        className="w-full max-w-[100vw] aspect-[16/9] sm:aspect-[1650/620] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative origin-center"
      >
        <video
          id="26e942c5-29be-bff2-c4b9-ed180bf26f21-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294%2F6880aabae19d4ca559dd4bc0_5369831_Coll_wavebreak_Businessman_1280x720-poster-00001.jpg"
          className="w-full h-full object-cover select-none pointer-events-none"
        >
          <source
            src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294%2F6880aabae19d4ca559dd4bc0_5369831_Coll_wavebreak_Businessman_1280x720-transcode.mp4"
            type="video/mp4"
          />
          <source
            src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294%2F6880aabae19d4ca559dd4bc0_5369831_Coll_wavebreak_Businessman_1280x720-transcode.webm"
            type="video/webm"
          />
        </video>
      </motion.div>
    </section>
  );
}

const topMinds = [
  {
    name: 'John Anderson',
    role: 'Head of Community Design',
    bgColor: '#7aaafd',
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/68807fe3fa2c3b7e74f497a7_f32842e72824373ee91071fc214bd16b_team-1.png'
  },
  {
    name: 'Carlos Mendes',
    role: 'Senior DevOps Engineer',
    bgColor: '#ffbdbd',
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891abdd656a3e0a19ab960e_688b4fcf7eec039af9714996_team-1%20(1).png'
  },
  {
    name: 'Ethan Zhao',
    role: 'AI Ethics Researcher',
    bgColor: '#fdd17a',
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891ad17e238089228940c0b_688b4fcf7eec039af9714996_team-1%20(2).png'
  },
  {
    name: 'Tomislav Petrovic',
    role: 'Blockchain Solutions Architect',
    bgColor: '#efa1ff',
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891acc20a821d240d8c73f9_sd.png'
  },
  {
    name: 'David Kim',
    role: 'VP of Product, TechNova',
    bgColor: '#ebffbe',
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6880c4a2029acc1ed84bf402_team-5.png'
  }
];

function MeetTopITMindsSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center']
  });

  // Smooth scroll animations with staggered spring physics for the two rows
  const rawYRow1 = useTransform(scrollYProgress, [0.1, 0.85], [90, 0]);
  const rawYRow2 = useTransform(scrollYProgress, [0.2, 0.95], [130, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0.1, 0.75], [0.4, 1]);

  const yRow1 = useSpring(rawYRow1, { stiffness: 75, damping: 22, mass: 0.5 });
  const yRow2 = useSpring(rawYRow2, { stiffness: 75, damping: 22, mass: 0.5 });
  const opacity = useSpring(rawOpacity, { stiffness: 75, damping: 22, mass: 0.5 });

  return (
    <div className="w-full py-8 sm:py-12 bg-black">
      <section
        ref={sectionRef}
        className="relative mx-3 sm:mx-6 lg:mx-8 xl:mx-12 bg-[#8617d0] text-white py-24 sm:py-32 lg:py-36 rounded-[32px] sm:rounded-[60px] lg:rounded-[80px] overflow-hidden shadow-2xl"
      >
        {/* Decorative Curved SVG Line Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 2355 1004"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M36.7591 997.712C66.2494 809.982 256.767 481.414 782.914 668.989C1309.06 856.564 1451.68 493.796 1516.82 314.529C1565.56 180.385 1819.23 -152.277 2334.34 182.969"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="74"
            />
          </svg>
        </div>

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Title & Two-Tone Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-semibold text-[#fdda7a] tracking-tight leading-tight capitalize">
              Meet All The Top IT Minds
            </h2>
            <div className="max-w-[506px] mx-auto text-sm sm:text-base font-semibold leading-[1.62]">
              <span className="text-white">
                Explore our lineup of keynote speakers and industry{' '}
              </span>
              <span className="text-white/50">
                leaders who will inspire and enlighten at the conference.
              </span>
            </div>
          </div>

          {/* 6-Card Grid (Larger Cards with Staggered Smooth Scroll Animation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {topMinds.map((sp, idx) => {
              const isSecondRow = idx >= 3;
              return (
                <motion.div
                  key={idx}
                  style={{
                    y: isSecondRow ? yRow2 : yRow1,
                    opacity
                  }}
                  className="group flex flex-col items-start"
                >
                  {/* Photo Card with Solid Colored BG - Enlarged Aspect Ratio */}
                  <div
                    style={{ backgroundColor: sp.bgColor }}
                    className="w-full aspect-[536/580] rounded-[24px] overflow-hidden relative flex items-end justify-center shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
                  >
                    <img
                      src={sp.img}
                      alt={sp.name}
                      className="w-full h-full object-contain object-bottom select-none pointer-events-none transform transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Speaker Name & Role */}
                  <div className="pt-4 text-left">
                    <h3 className="text-xl sm:text-[22px] font-semibold text-white tracking-tight leading-snug">
                      {sp.name}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-white/80 font-normal mt-1 leading-normal">
                      {sp.role}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* 6th Card: Buy Ticket Action Card (Enlarged with Smooth Scroll Animation) */}
            <motion.div
              style={{
                y: yRow2,
                opacity
              }}
              className="w-full flex flex-col"
            >
              <Link
                to="/events"
                className="w-full aspect-[536/580] rounded-[24px] bg-[#a45ae1] border border-[#af6ee5] hover:bg-[#b269ec] text-white flex items-center justify-center text-center p-8 transition-all duration-300 transform hover:-translate-y-2 shadow-xl hover:shadow-2xl group cursor-pointer"
              >
                <span className="text-4xl sm:text-5xl font-medium tracking-tight group-hover:scale-105 transition-transform duration-300">
                  Buy Ticket
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

const silverLogos = [
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881b45935693327d5fe394a_bd-1.svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881b61130736a90e0df7bbb_bd-2.svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891ae85234f29abc272b917_Vector%20(2).svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891ae334261c120b0616c8a_Vector%20(1).svg'
];

const diamondLogos = [
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891add3c46a3e984a1f980d_Vector.svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891ae0c2d62fe871ef913bb_Group%201171275207.svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881b6206105ae900fbfabeb_bd-3.svg',
  'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881b66d3845bfd44f25a18e_bd-4.svg'
];

function SponsorLogoCard({ src, alt, offset, cornerClass, progress }) {
  const x = useTransform(progress, [0, 1], [offset.x, 0]);
  const y = useTransform(progress, [0, 1], [offset.y, 0]);
  const rotate = useTransform(progress, [0, 1], [offset.r, 0]);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  const opacity = useTransform(progress, [0, 0.4], [0.4, 1]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity }}
      className={`aspect-[4/3] border border-white/[0.04] bg-[#141414] ${cornerClass} flex items-center justify-center p-6 hover:bg-[#1a1a1a] hover:border-white/10 transition-colors duration-300 group cursor-pointer`}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-10 sm:max-h-12 w-auto object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 select-none pointer-events-none brightness-90 group-hover:brightness-100"
        loading="lazy"
      />
    </motion.div>
  );
}

function SponsorBox({ title, logos, progress }) {
  const scatterOffsets = [
    { x: 32, y: 22, r: -2.5 }, // top-left
    { x: -32, y: 22, r: 2.5 }, // top-right
    { x: 32, y: -22, r: 1.5 }, // bottom-left
    { x: -32, y: -22, r: -1.5 } // bottom-right
  ];

  const cornerClasses = [
    'rounded-tl-[20px] rounded-tr-[5px] rounded-bl-[5px] rounded-br-[5px]', // top-left
    'rounded-tr-[20px] rounded-tl-[5px] rounded-br-[5px] rounded-bl-[5px]', // top-right
    'rounded-bl-[20px] rounded-tl-[5px] rounded-br-[5px] rounded-tr-[5px]', // bottom-left
    'rounded-br-[20px] rounded-tr-[5px] rounded-bl-[5px] rounded-tl-[5px]'  // bottom-right
  ];

  return (
    <div className="border border-white/[0.06] bg-[#0d0d0d] rounded-[28px] p-6 sm:p-8 lg:p-9 backdrop-blur-sm shadow-2xl">
      <h3 className="text-xl sm:text-[22px] font-normal text-[#9e6ce8] mb-6 sm:mb-8 tracking-tight">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {logos.map((src, i) => (
          <SponsorLogoCard
            key={i}
            src={src}
            alt={title}
            offset={scatterOffsets[i % 4]}
            cornerClass={cornerClasses[i % 4]}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

function BrandPartnersSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 60%']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    restDelta: 0.001
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white py-24 sm:py-32 overflow-hidden border-t border-white/5"
    >
      {/* Decorative Brand SVG Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <img
          src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881ba39f7ad32e8b73f01ba_shap-1.svg"
          alt=""
          className="absolute top-0 left-0 max-w-sm"
          loading="lazy"
        />
        <img
          src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881bbaf37ef7eadd91662a5_shap-2.svg"
          alt=""
          className="absolute top-0 right-0 max-w-sm"
          loading="lazy"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Title on left, Two-Tone Description on right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-14 sm:pb-16">
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-6xl lg:text-[72px] font-semibold text-white tracking-tight leading-[1.08]">
              We Are Partners
            </h2>
            <h2 className="text-4xl sm:text-6xl lg:text-[72px] font-semibold text-[#747070] tracking-tight leading-[1.08]">
              In Innovation
            </h2>
          </div>

          <div className="max-w-[420px] text-sm sm:text-base font-normal leading-[1.62] text-left">
            <span className="text-white/90">
              Meet the organizations fueling our event. Our{' '}
            </span>
            <span className="text-white font-semibold">
              sponsors are leaders in tech,{' '}
            </span>
            <span className="text-[#747070]">
              helping us create an extraordinary experience.
            </span>
          </div>
        </div>

        {/* Sponsor Boxes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <SponsorBox
            title="Silver Sponsor"
            logos={silverLogos}
            progress={smoothProgress}
          />
          <SponsorBox
            title="Diamond Sponsor"
            logos={diamondLogos}
            progress={smoothProgress}
          />
        </div>
      </div>
    </section>
  );
}

