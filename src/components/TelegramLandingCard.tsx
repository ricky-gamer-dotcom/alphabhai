import React, { useState, useEffect } from 'react';
import { LandingPageConfig } from '../types';

interface TelegramLandingCardProps {
  config: LandingPageConfig;
  onJoinClick?: () => void;
  onSecretAdminClick?: () => void;
}

export function TelegramLandingCard({
  config,
  onJoinClick,
  onSecretAdminClick,
}: TelegramLandingCardProps) {
  // Live countdown timer for the "TIME LEFT FOR FREE JOIN" card
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('free_join_timer');
      const num = saved ? parseInt(saved, 10) : 15;
      return !isNaN(num) && num > 0 ? num : 15;
    } catch {
      return 15;
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev <= 1 ? 15 : prev - 1;
        try {
          sessionStorage.setItem('free_join_timer', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = `00:${String(secondsLeft).padStart(2, '0')}`;

  const handleCtaClick = () => {
    if (onJoinClick) {
      onJoinClick();
    }
  };

  // Subtitle text handling (matches "Your Premium Gaming Destination 🎰")
  const subtitle = config.badgeText && !config.badgeText.includes('OFFICIAL')
    ? config.badgeText
    : 'Your Premium Gaming Destination 🎰';

  return (
    <div
      id="telegram-landing-card"
      className="relative w-full max-w-[390px] sm:max-w-[420px] mx-auto rounded-[32px] sm:rounded-[36px] p-5 sm:p-7 flex flex-col items-center text-center select-none transition-all duration-300 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(180deg, rgba(18, 18, 20, 0.82) 0%, rgba(8, 8, 10, 0.94) 100%)',
        boxShadow:
          '0 30px 70px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(255, 255, 255, 0.04), inset 0 1px 1.5px rgba(255, 255, 255, 0.18)',
        border: '1.5px solid rgba(255, 255, 255, 0.14)',
      }}
    >
      {/* Subtle ambient glass reflections inside card */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 bg-white/[0.035] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-56 h-56 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP BADGE: • LIVE NOW */}
      <div
        id="channel-live-badge"
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181818]/90 border border-white/10 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-5 shadow-sm select-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span>{config.liveBadgeText || 'LIVE NOW'}</span>
      </div>

      {/* 2. CIRCULAR AVATAR (Pure dark ring matching screenshot) */}
      <div className="relative mb-4 select-none pointer-events-none">
        {/* Subtle ambient halo */}
        <div className="absolute -inset-1 rounded-full bg-white/[0.04] blur-xl" />

        <div className="relative p-1 rounded-full bg-[#121212] border-2 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.85),0_0_15px_rgba(255,255,255,0.05)]">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-black">
            <img
              src={config.avatarUrl}
              alt={config.channelName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* 3. CHANNEL TITLE (Clean Bold White Typography + Hearts/Wings) */}
      <div className="flex items-center justify-center gap-1.5 mb-1 w-full">
        <h1
          id="channel-title-heading"
          className="text-2xl sm:text-[28px] font-black uppercase tracking-wider text-white drop-shadow-sm flex items-center justify-center gap-1.5"
          style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
        >
          <span>{config.channelName}</span>
          <span className="text-xl sm:text-2xl select-none">🤍🕊️</span>
        </h1>
      </div>

      {/* 4. SUBTITLE */}
      <p
        id="channel-subtitle"
        className="text-xs sm:text-sm text-gray-300 font-normal tracking-wide text-center max-w-[340px] leading-relaxed"
      >
        {subtitle}
      </p>

      {/* 5. SUBTLE DIVIDER BAR */}
      <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mx-auto my-4 opacity-70" />

      {/* 6. MAIN CTA BUTTON: JOIN NOW (Dark Luxury Glass with Real Telegram Logos on Left & Right) */}
      <div className="w-full relative group my-1">
        {/* Ambient soft glow aura beneath the button */}
        <div className="absolute -inset-1 bg-white/[0.08] rounded-2xl blur-xl animate-cta-glow pointer-events-none" />

        <a
          id="join-channel-cta-button"
          href={config.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          style={{ touchAction: 'manipulation' }}
          className="relative w-full py-4 px-5 sm:px-6 rounded-2xl font-black text-lg sm:text-xl tracking-widest text-white uppercase flex items-center justify-between cursor-pointer overflow-hidden select-none bg-[#161618] hover:bg-[#202024] border border-white/20 active:scale-[0.97] transition-all animate-cta-pulse shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.22)]"
        >
          {/* Continuous automatic shimmer sheen */}
          <div className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none animate-cta-shimmer" />

          {/* Left: Real Telegram Brand Logo */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
            <img
              src="./telegram-logo.svg"
              alt="Telegram"
              className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(34,158,217,0.6)]"
              loading="eager"
            />
          </div>

          {/* Center: JOIN NOW button text */}
          <span
            className="font-black tracking-widest text-white drop-shadow-sm px-2 text-center"
            style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
          >
            {config.buttonText || 'JOIN NOW'}
          </span>

          {/* Right: Real Telegram Brand Logo */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
            <img
              src="./telegram-logo.svg"
              alt="Telegram"
              className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(34,158,217,0.6)]"
              loading="eager"
            />
          </div>
        </a>
      </div>

      {/* 7. TIME LEFT FOR FREE JOIN CARD */}
      <div
        id="timer-countdown-card"
        className="w-full rounded-2xl bg-[#121212]/90 border border-white/10 p-4 sm:p-5 text-center mt-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
      >
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-400 uppercase block">
          TIME LEFT FOR FREE JOIN
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest my-1 font-mono">
          {formattedTimer}
        </div>
        <p className="text-[11px] sm:text-xs text-gray-400/90 leading-tight">
          Offer starts counting down as soon as you open the page.
        </p>
      </div>

      {/* 8. STATS ROW (3 Columns: MEMBERS | SUPPORT | SECURE) */}
      <div className="w-full grid grid-cols-3 pt-6 mt-2">
        {/* Members */}
        <div className="flex flex-col items-center justify-center border-r border-white/10 px-2">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {config.membersCount || '50K+'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
            MEMBERS
          </span>
        </div>

        {/* 24/7 Support */}
        <div className="flex flex-col items-center justify-center border-r border-white/10 px-2">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            24/7
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
            SUPPORT
          </span>
        </div>

        {/* 100% Secure */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            100%
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
            SECURE
          </span>
        </div>
      </div>

      {/* 9. FOOTER (With secret admin trigger on multi-tap) */}
      <div
        id="card-footer-copyright"
        onClick={onSecretAdminClick}
        className="mt-6 text-center select-none cursor-default"
      >
        <p className="text-[11px] text-gray-400 font-normal">
          © 2026 All rights reserved.
        </p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
          Ads Managed By @JACKAGENCY
        </p>
      </div>
    </div>
  );
}

