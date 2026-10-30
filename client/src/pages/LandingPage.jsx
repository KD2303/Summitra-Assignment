import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  Calendar,
  Plus
} from 'lucide-react';

export function LandingPage() {
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
    <main id="main-content" className="overflow-x-clip bg-black text-white">
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
                    <MapPin className="w-4 h-4 text-black" />
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
      <section className="relative bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-40 pb-16 sm:pb-28 overflow-hidden">
        {/* Background Decorative Ellipse */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6880a791735d2e2ce92c8243_Ellipse%204.svg"
            alt=""
            loading="lazy"
            className="absolute top-0 right-0 max-w-[260px] sm:max-w-lg opacity-40 pointer-events-none"
          />
        </div>

        <div className="relative max-w-[1160px] mx-auto z-10">
          {/* Section Title */}
          <h2 className="text-[52px] sm:text-7xl lg:text-[90px] xl:text-[96px] font-medium text-white tracking-[-0.02em] leading-none mb-7 sm:mb-14 lg:mb-16">
            About
          </h2>

          {/* Large Editorial Statement */}
          <div className="text-xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[48px] font-medium leading-[1.35] sm:leading-[1.28] tracking-[-0.02em] sm:tracking-[-0.03em]">
            <span className="text-white">
              Summitra 2025 is an immersive, IT Conference over the course of
              three days,{' '}
            </span>
            <span className="text-[#a278d9]">August 13-15.</span>
            <span className="text-white"> Our mission,</span>
            <span className="text-[#747070]">
              {' '}the challenges, A person's success is measured by the way they
              approach it and how they approach it.
            </span>
          </div>

          {/* Countdown Timer + Buy Ticket */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 mt-10 sm:mt-16 lg:mt-20">
            {/* 4 Dark Aspect-Ratio Countdown Boxes — 2×2 on mobile, 4-in-a-row on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 w-full sm:w-auto">
              <div className="w-full sm:w-[110px] sm:h-[110px] lg:w-[124px] lg:h-[124px] aspect-square bg-[#111111] rounded-xl flex flex-col items-center justify-center p-2">
                <div className="text-3xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-[15px] text-[#a3a3a3] font-normal mt-2">
                  Days
                </div>
              </div>

              <div className="w-full sm:w-[110px] sm:h-[110px] lg:w-[124px] lg:h-[124px] aspect-square bg-[#111111] rounded-xl flex flex-col items-center justify-center p-2">
                <div className="text-3xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-[15px] text-[#a3a3a3] font-normal mt-2">
                  Hours
                </div>
              </div>

              <div className="w-full sm:w-[110px] sm:h-[110px] lg:w-[124px] lg:h-[124px] aspect-square bg-[#111111] rounded-xl flex flex-col items-center justify-center p-2">
                <div className="text-3xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-[15px] text-[#a3a3a3] font-normal mt-2">
                  Minutes
                </div>
              </div>

              <div className="w-full sm:w-[110px] sm:h-[110px] lg:w-[124px] lg:h-[124px] aspect-square bg-[#111111] rounded-xl flex flex-col items-center justify-center p-2">
                <div className="text-3xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-[15px] text-[#a3a3a3] font-normal mt-2">
                  Seconds
                </div>
              </div>
            </div>

            {/* Buy Ticket Pill Button — full-width on mobile, auto on sm+ */}
            <div className="w-full sm:w-auto">
              <Link
                to="/events"
                className="flex sm:inline-flex items-center justify-center gap-3.5 pl-7 pr-2.5 py-3 rounded-full bg-white text-black font-semibold text-base hover:bg-zinc-100 transition-all duration-200 shadow-xl group"
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
      {/* 3.4 RESOURCES FROM PAST CONFERENCES SECTION */}
      {/* ============================================================== */}
      <ResourcesFromPastConferencesSection />

      {/* ============================================================== */}
      {/* 3.5 ORGANIZE YOUR SCHEDULE SECTION */}
      {/* ============================================================== */}
      <ScheduleSection />

      {/* ============================================================== */}
      {/* 3.6 PRICING FOR TICKETS SECTION */}
      {/* ============================================================== */}
      <PricingSection />

      {/* ============================================================== */}
      {/* 3.7 FREQUENTLY ASKED QUESTIONS SECTION */}
      {/* ============================================================== */}
      <FAQSection />

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

const pastConferenceResources = [
  {
    id: 1,
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c89f33b882801c6cd6fb_resources-1.jpg',
    srcSet:
      'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c89f33b882801c6cd6fb_resources-1-p-500.jpg 500w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c89f33b882801c6cd6fb_resources-1-p-800.jpg 800w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c89f33b882801c6cd6fb_resources-1.jpg 847w',
    alt: 'Keynote auditorium audience and presentation screen',
    caption: 'Main Stage & Keynote Presentations'
  },
  {
    id: 2,
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8b13d6e0ca2baa840f9_resources-2.jpg',
    srcSet:
      'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8b13d6e0ca2baa840f9_resources-2-p-500.jpg 500w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8b13d6e0ca2baa840f9_resources-2-p-800.jpg 800w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8b13d6e0ca2baa840f9_resources-2.jpg 847w',
    alt: 'Interactive breakout sessions and roundtable collaboration',
    caption: 'Interactive Workshops & Tech Sessions'
  },
  {
    id: 3,
    img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8c72748e6142d501a46_resources-3.jpg',
    srcSet:
      'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8c72748e6142d501a46_resources-3-p-500.jpg 500w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8c72748e6142d501a46_resources-3-p-800.jpg 800w, https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6881c8c72748e6142d501a46_resources-3.jpg 847w',
    alt: 'Community networking and summit attendees greeting',
    caption: 'Community Connections & Socials'
  }
];

function ResourcesFromPastConferencesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="w-full py-8 sm:py-12 bg-black">
      <section className="relative mx-3 sm:mx-6 lg:mx-8 xl:mx-12 bg-[#8617d0] text-white py-20 sm:py-28 lg:py-32 rounded-[32px] sm:rounded-[60px] lg:rounded-[80px] overflow-hidden shadow-2xl">
        {/* Decorative Curved SVG Line Overlay */}
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

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 z-10">
          {/* Title & Two-Tone Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-semibold text-[#fdda7a] tracking-tight leading-tight capitalize">
              Resources From Past
              <br className="hidden sm:inline" /> Conferences
            </h2>
            <div className="max-w-[506px] mx-auto text-sm sm:text-base font-semibold leading-[1.62]">
              <span className="text-white">
                Explore our lineup of keynote speakers and industry{' '}
              </span>
              <span className="text-white/60">
                leaders who will inspire and enlighten at the conference.
              </span>
            </div>
          </div>

          {/* Interactive Expandable Gallery */}
          <div
            className="flex flex-row gap-3 sm:gap-4 md:gap-5 h-[340px] sm:h-[450px] md:h-[520px] lg:h-[600px] w-full"
            onMouseLeave={() => setActiveIdx(0)}
          >
            {pastConferenceResources.map((item, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative rounded-[18px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                    isActive
                      ? 'flex-[2.2] shadow-2xl ring-1 ring-white/20'
                      : 'flex-1 hover:brightness-105'
                  }`}
                >
                  <img
                    src={item.img}
                    srcSet={item.srcSet}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 847px"
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                      isActive ? 'opacity-60' : 'opacity-20'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const scheduleData = [
  {
    id: 1,
    time: '09:00 - 10:00 am',
    title: 'Opening',
    description:
      'Kick off the day with a warm welcome from the host. We’ll walk through the schedule, introduce key speakers, and set the tone for an inspiring day.',
    speakers: []
  },
  {
    id: 2,
    time: '10.30 - 11.50 am',
    title: 'Keynote Speech: The Future of Tech',
    description:
      'A visionary talk by our headline speaker on where technology is heading—AI, SaaS, and innovation in the digital age.',
    speakers: [
      {
        name: 'Tomislav P.',
        img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891acc20a821d240d8c73f9_sd.png'
      },
      {
        name: 'Ethan Zhao',
        img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891ad17e238089228940c0b_688b4fcf7eec039af9714996_team-1%20(2).png'
      }
    ]
  },
  {
    id: 3,
    time: '12.00 - 12.50 am',
    title: 'Live App Showcase',
    description:
      'See demos of exciting new SaaS products, apps, and platforms. A mix of startup spotlights and enterprise innovation.',
    speakers: [
      {
        name: 'John Anderson',
        img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/68807fe3fa2c3b7e74f497a7_f32842e72824373ee91071fc214bd16b_team-1.png'
      }
    ]
  },
  {
    id: 4,
    time: '1.20 - 2:30 pm',
    title: 'Networking Lunch',
    description:
      'Enjoy food, meet other attendees, and make real connections. Swap ideas, business cards, and maybe your next partnership.',
    speakers: []
  },
  {
    id: 5,
    time: '3:00 - 4:30 pm',
    title: 'Building Scalable Products',
    description:
      'Top founders and product leads share real stories and strategies on building tools that grow with users and markets.',
    speakers: [
      {
        name: 'Jonathan',
        img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891a86d98f9bef9d385160b_6880802c60e7f6881998217f_df20dfb4a6d3c10988d870b3dd6a4aa9_team-2%20(1).png'
      },
      {
        name: 'Ahmed Faizal',
        img: 'https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/6891aac603a49c7db89b4af7_6880802c60e7f6881998217f_df20dfb4a6d3c10988d870b3dd6a4aa9_team-2%20(2).png'
      }
    ]
  },
  {
    id: 6,
    time: '5.00 - 5:30 pm',
    title: 'Closing Remarks & Next Steps',
    description:
      'We’ll recap the day, thank our speakers, and share what’s next—including post-event resources and recordings.',
    speakers: []
  }
];

function ScheduleSection() {
  return (
    <section className="relative bg-black text-white py-16 sm:py-24 lg:py-36 border-t border-white/5">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile: heading + CTA first, then cards below */}
        {/* Desktop: purple line | cards | sticky heading */}
        <div className="grid grid-cols-1 lg:grid-cols-[12px_1fr_420px] xl:grid-cols-[12px_1fr_480px] gap-8 lg:gap-12 xl:gap-14 items-start">
          {/* Vertical Purple Accent Line (desktop only) */}
          <div className="hidden lg:block w-3 bg-[#8617d0] rounded-full self-stretch min-h-full" />

          {/* Schedule Cards List */}
          <div className="flex flex-col gap-4 sm:gap-8 pb-8 sm:pb-28 sm:pb-36 order-2 lg:order-1 relative">
            {scheduleData.map((item, idx) => (
              <div
                key={item.id}
                className="sm:sticky rounded-[16px] sm:rounded-[24px] bg-[#0c0c0c] border border-white/[0.1] hover:border-[#8617d0]/50 shadow-[0_-14px_40px_rgba(0,0,0,0.92)] p-5 sm:p-10 lg:p-12 space-y-4 sm:space-y-7 transition-all duration-300"
                style={{
                  top: `calc(90px + ${idx * 16}px)`,
                  zIndex: 10 + idx
                }}
              >
                {/* Time */}
                <div className="text-xs sm:text-base font-normal text-[#aeaeae]">
                  {item.time}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-[32px] font-medium text-white tracking-tight leading-[1.3]">
                  {item.title}
                </h3>

                {/* Speaker Cards */}
                {item.speakers && item.speakers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                    {item.speakers.map((sp, sIdx) => (
                      <div key={sIdx} className="inline-flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-[37px] sm:h-[37px] rounded-full overflow-hidden flex-shrink-0 bg-zinc-800">
                          <img
                            src={sp.img}
                            alt={sp.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs sm:text-[15px] font-normal text-white">
                          {sp.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs sm:text-base text-[#aeaeae] font-normal leading-[1.6]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sticky Header + Buy Ticket CTA — stacks above cards on mobile */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28 space-y-5 sm:space-y-7 lg:pl-4">
            {/* Heading */}
            <h2 className="text-4xl sm:text-7xl lg:text-[76px] xl:text-[88px] font-semibold text-white tracking-[-0.02em] leading-[1.05]">
              Organize
              <br />
              Your
              <br />
              Schedule
            </h2>

            {/* Subtitle */}
            <div className="space-y-1 text-sm sm:text-lg leading-[1.6] max-w-[440px]">
              <p className="text-white font-semibold">
                Explore our lineup of keynote speakers and industry
              </p>
              <p className="text-[#aeaeae]">
                leaders who will inspire and enlighten at the conference.
              </p>
            </div>

            {/* Buy Ticket CTA */}
            <div className="pt-1 sm:pt-3">
              <Link
                to="/events"
                className="inline-flex items-center gap-3.5 pl-7 pr-2.5 py-2.5 rounded-full bg-white text-black font-semibold text-base hover:bg-zinc-100 transition-all duration-200 group shadow-lg"
              >
                <span>Buy Ticket</span>
                <span className="w-9 h-9 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover:scale-105 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    tier: 'Basic',
    price: '$99',
    cta: 'Get a seat',
    description:
      'Explore our lineup of keynote speakers and industry leaders who will inspire and enlighten at the conference.',
    features: [
      'Full event access',
      'Access to keynote & breakout sessions',
      'Networking opportunities',
      'Access to post-event session recordings',
      'Conference materials and swag bag'
    ]
  },
  {
    tier: 'Premium',
    price: '$399',
    cta: 'Get a seat',
    description:
      'Explore our lineup of keynote speakers and industry leaders who will inspire and enlighten at the conference.',
    features: [
      'Full event access',
      'Access to keynote & breakout sessions',
      'Networking opportunities',
      'Access to post-event session recordings',
      'Conference materials and swag bag'
    ]
  }
];

function PricingSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 55%']
  });

  const rawYCard1 = useTransform(scrollYProgress, [0.1, 0.85], [70, 0]);
  const rawYCard2 = useTransform(scrollYProgress, [0.2, 0.95], [120, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0.1, 0.75], [0.35, 1]);
  const rawScale = useTransform(scrollYProgress, [0.1, 0.9], [0.95, 1]);
  const rawHeadY = useTransform(scrollYProgress, [0.05, 0.5], [40, 0]);

  const yCard1 = useSpring(rawYCard1, { stiffness: 75, damping: 22, mass: 0.5 });
  const yCard2 = useSpring(rawYCard2, { stiffness: 75, damping: 22, mass: 0.5 });
  const opacity = useSpring(rawOpacity, { stiffness: 75, damping: 22, mass: 0.5 });
  const scale = useSpring(rawScale, { stiffness: 75, damping: 22, mass: 0.5 });
  const headY = useSpring(rawHeadY, { stiffness: 75, damping: 22, mass: 0.5 });

  const cardYs = [yCard1, yCard2];

  return (
    <div className="w-full py-8 sm:py-12 bg-black">
      <section
        ref={sectionRef}
        className="relative mx-3 sm:mx-6 lg:mx-8 xl:mx-12 bg-[#8617d0] text-white py-20 sm:py-28 lg:py-32 rounded-[32px] sm:rounded-[60px] lg:rounded-[80px] overflow-hidden shadow-2xl"
      >
        {/* Decorative Curved SVG Line Overlay */}
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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Section Header with smooth spring entrance */}
          <motion.div
            style={{ y: headY, opacity }}
            className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-semibold text-[#fdda7a] tracking-tight leading-tight capitalize">
              Pricing For Tickets
            </h2>
            <div className="max-w-[506px] mx-auto text-sm sm:text-base font-semibold leading-[1.62]">
              <span className="text-white">
                Explore our lineup of keynote speakers and industry{' '}
              </span>
              <span className="text-white/60">
                leaders who will inspire and enlighten at the conference.
              </span>
            </div>
          </motion.div>

          {/* Pricing Cards Grid with Staggered Scroll Spring Physics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                style={{
                  y: cardYs[idx],
                  opacity,
                  scale
                }}
                className="relative rounded-[28px] sm:rounded-[36px] bg-white/[0.08] backdrop-blur-md border border-white/20 p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden shadow-xl hover:bg-white/[0.12] hover:border-white/30 transition-colors duration-300 group"
              >
                {/* Decorative Shape in top-right */}
                <img
                  src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/688496734d2ec455ce583e1e_Vector%20(1).svg"
                  alt=""
                  loading="lazy"
                  className="absolute top-0 right-0 w-44 pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />

                <div className="space-y-6 relative z-10">
                  {/* Tier Badge */}
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold text-white/90">
                    {plan.tier}
                  </div>

                  {/* Price & CTA Text */}
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-5xl sm:text-6xl lg:text-[68px] font-bold text-[#fdda7a] tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-white/80 font-medium">
                      {plan.cta}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-[15px] text-white/80 leading-relaxed max-w-md">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3.5 pt-4 border-t border-white/15">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3">
                        <img
                          src="https://cdn.prod.website-files.com/687f5648b07a8b67bf809294/688475c5161faac4bd544101_Star%201.svg"
                          alt="star"
                          loading="lazy"
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-sm sm:text-[15px] text-white font-medium">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buy Ticket Button */}
                <div className="pt-8 relative z-10">
                  <Link
                    to="/events"
                    className="w-full inline-flex items-center justify-between pl-8 pr-2.5 py-3 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:bg-zinc-100 transition-all duration-200 group/btn shadow-lg"
                  >
                    <span className="mx-auto">Buy Ticket</span>
                    <span className="w-9 h-9 rounded-full bg-[#8617d0] text-white flex items-center justify-center group-hover/btn:scale-105 group-hover/btn:translate-x-0.5 transition-transform duration-200 flex-shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const faqColumn1 = [
  {
    id: 1,
    question: 'Will the talks be recorded?',
    answer:
      'Yes, all main stage keynotes and panel discussions are recorded in high-definition. Access to post-event recordings is included with your ticket and will be made available in your attendee portal shortly after the event concludes.'
  },
  {
    id: 2,
    question: 'Is this event just for designers?',
    answer:
      'With your ticket, you’ll receive entry to the event and access to all included features. These may range from general admission to VIP perks. Every tier offers something a little different.'
  },
  {
    id: 3,
    question: 'Does my ticket cover everything?',
    answer:
      'Most tickets include access to the main attractions, but some areas, services, or merchandise might require an upgrade. It’s important to verify what’s included to avoid surprises on event day.'
  },
  {
    id: 4,
    question: 'Can I refund or transfer my ticket?',
    answer:
      'Yes! Every ticket includes base-level access to the event. Higher-tier tickets may also include special perks like lounge access, priority entry, or complimentary items.'
  }
];

const faqColumn2 = [
  {
    id: 5,
    question: 'What is the conference about ?',
    answer:
      'Depending on the level of your ticket, you may receive early access, reserved seating, or bonus gifts. Benefits are designed to enhance your experience and are clearly listed when you book.'
  },
  {
    id: 6,
    question: 'Are there any perks with my ticket?',
    answer:
      'Ticket packages vary but often include entry, merchandise, and access to special areas or experiences. Premium packages may also feature food, drink, or exclusive meet-and-greets.'
  },
  {
    id: 7,
    question: 'What does my ticket include?',
    answer:
      'Of course! Each ticket includes a specific set of features and event access. Check the ticket description for a full breakdown of what is provided with your pass.'
  },
  {
    id: 8,
    question: 'How to become a speaker?',
    answer:
      'Your ticket purchase covers the base cost of entry and any listed amenities. In some cases, it may also include food, drinks, or access to additional activities and spaces.'
  }
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-[14px] sm:rounded-[18px] bg-[#0c0c0c] border border-white/[0.08] hover:border-[#8617d0]/40 transition-all duration-300 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8617d0]"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-semibold text-white/95 pr-4 leading-snug">
          {item.question}
        </span>
        <Plus
          className={`w-4 h-4 text-white/70 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-45 text-[#c084fc]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="overflow-hidden"
        >
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-[#aeaeae] leading-relaxed border-t border-white/[0.04] pt-4">
            <p>{item.answer}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FAQSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center 60%']
  });

  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Header scroll entrance
  const rawHeadY = useTransform(scrollYProgress, [0.05, 0.45], [40, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0.08, 0.55], [0.25, 1]);
  const headY = useSpring(rawHeadY, { stiffness: 75, damping: 22, mass: 0.5 });
  const opacity = useSpring(rawOpacity, { stiffness: 75, damping: 22, mass: 0.5 });

  // Staggered Y offsets for the 4 rows of questions
  const rawY0 = useTransform(scrollYProgress, [0.1, 0.6], [50, 0]);
  const rawY1 = useTransform(scrollYProgress, [0.18, 0.7], [70, 0]);
  const rawY2 = useTransform(scrollYProgress, [0.26, 0.8], [90, 0]);
  const rawY3 = useTransform(scrollYProgress, [0.34, 0.9], [110, 0]);

  const y0 = useSpring(rawY0, { stiffness: 75, damping: 22, mass: 0.5 });
  const y1 = useSpring(rawY1, { stiffness: 75, damping: 22, mass: 0.5 });
  const y2 = useSpring(rawY2, { stiffness: 75, damping: 22, mass: 0.5 });
  const y3 = useSpring(rawY3, { stiffness: 75, damping: 22, mass: 0.5 });

  const rowYs = [y0, y1, y2, y3];

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white py-24 sm:py-32 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          style={{ y: headY, opacity }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight text-center mb-14 sm:mb-20"
        >
          Frequently Asked Questions
        </motion.h2>

        {/* 2-Column Accordion Grid with Staggered Scroll Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {faqColumn1.map((item, idx) => (
              <motion.div
                key={item.id}
                style={{ y: rowYs[idx], opacity }}
              >
                <FAQItem
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {faqColumn2.map((item, idx) => (
              <motion.div
                key={item.id}
                style={{ y: rowYs[idx], opacity }}
              >
                <FAQItem
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

