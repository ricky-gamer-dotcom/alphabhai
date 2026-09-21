import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { DEFAULT_CONFIG } from './data';
import { LandingPageConfig } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { TelegramLandingCard } from './components/TelegramLandingCard';
import { AdminPanelModal } from './components/AdminPanelModal';
import { firePixelPageViewOnce, firePixelSubscribeOnce } from './utils/pixel';

export default function App() {
  // Load initial config with 1000% preserved gallery avatar
  const [config, setConfig] = useState<LandingPageConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('alpha_bhai_config');
      const savedAvatar = localStorage.getItem('alpha_bhai_avatar');
      let initial = { ...DEFAULT_CONFIG };
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        initial = { ...initial, ...parsed };
      }
      if (savedAvatar && savedAvatar.length > 50) {
        initial.avatarUrl = savedAvatar;
      }
      initial.telegramLink = 'https://t.me/+mVO1R7zmazwyMDg9';
      initial.buttonText = 'JOIN NOW';
      initial.showBrowserBar = false;
      initial.autoRedirect = false;
      return initial;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Builder / Creator Mode: Only visible when creating in AI Studio preview / dev mode
  // Completely hidden for visitors on published website
  const [isBuilderMode, setIsBuilderMode] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const host = window.location.hostname;
      // 1. Dev container / localhost
      const isDevHost = host.includes('-dev-') || host === 'localhost' || host === '127.0.0.1';
      // 2. Embedded inside AI Studio builder iframe
      const isStudioIframe = window.self !== window.top;
      // 3. Secret url query ?admin=true or ?edit=1
      const search = window.location.search;
      const hasAdminParam = search.includes('admin=') || search.includes('edit=1');

      return isDevHost || isStudioIframe || hasAdminParam;
    } catch (e) {
      return false;
    }
  });

  // Secret 5-tap counter on footer so creator can still unlock on live site if ever needed
  const handleSecretFooterTap = () => {
    if (isBuilderMode) {
      setIsAdminModalOpen(true);
    } else {
      // Allow creator to unlock by quick multi-tap
      const currentTaps = Number(sessionStorage.getItem('footer_taps') || 0) + 1;
      sessionStorage.setItem('footer_taps', String(currentTaps));
      if (currentTaps >= 5) {
        sessionStorage.removeItem('footer_taps');
        setIsBuilderMode(true);
        setIsAdminModalOpen(true);
      }
    }
  };

  // Fetch 1000% server-locked configuration and locked avatar for all public visitors
  useEffect(() => {
    let isMounted = true;
    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((serverConfig) => {
        if (isMounted && serverConfig && serverConfig.channelName) {
          setConfig((prev) => {
            const merged = {
              ...prev,
              ...serverConfig,
              telegramLink: 'https://t.me/+mVO1R7zmazwyMDg9',
              buttonText: 'JOIN NOW',
            };
            try {
              localStorage.setItem('alpha_bhai_config', JSON.stringify(merged));
              if (merged.avatarUrl) {
                localStorage.setItem('alpha_bhai_avatar', merged.avatarUrl);
              }
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch((err) => {
        // Fallback for static hosting like GitHub Pages
        fetch('./public-config.json')
          .then((res) => {
            if (!res.ok) throw new Error('Static config not found');
            return res.json();
          })
          .then((staticConfig) => {
            if (isMounted && staticConfig && staticConfig.channelName) {
              setConfig((prev) => {
                const merged = {
                  ...prev,
                  ...staticConfig,
                  telegramLink: 'https://t.me/+mVO1R7zmazwyMDg9',
                  buttonText: 'JOIN NOW',
                };
                try {
                  localStorage.setItem('alpha_bhai_config', JSON.stringify(merged));
                  if (merged.avatarUrl) {
                    localStorage.setItem('alpha_bhai_avatar', merged.avatarUrl);
                  }
                } catch (e) {}
                return merged;
              });
            }
          })
          .catch((staticErr) => {
            console.log('Config initialization ready:', staticErr.message);
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-resolve DNS and warm network connection to Telegram for 0.1ms instant access
  useEffect(() => {
    try {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = 'https://t.me';
      document.head.appendChild(link);
    } catch (e) {}

    // Manually fire Meta Pixel PageView strictly once
    firePixelPageViewOnce();
  }, []);

  // Instant audio click synthesizer (non-blocking)
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {
      // Audio might be quiet on touch gesture
    }
  };

  // Instant 0.1ms touch feedback + manual single-fire Subscribe pixel
  const handleJoin = () => {
    firePixelSubscribeOnce();
    playClickSound();
  };

  // Update config while locking the gallery avatar 1000% so other edits NEVER change it
  const handleUpdateConfig = async (
    newVals: Partial<LandingPageConfig> & { isNewGalleryUpload?: boolean }
  ) => {
    const activeAvatar =
      (newVals.isNewGalleryUpload ? newVals.avatarUrl : null) ||
      config.avatarUrl ||
      localStorage.getItem('alpha_bhai_avatar') ||
      DEFAULT_CONFIG.avatarUrl;

    const updated: LandingPageConfig = {
      ...config,
      ...newVals,
      avatarUrl: activeAvatar,
      telegramLink: 'https://t.me/+mVO1R7zmazwyMDg9',
      buttonText: 'JOIN NOW',
      autoRedirect: false,
      showBrowserBar: false,
    };

    setConfig(updated);

    try {
      localStorage.setItem('alpha_bhai_config', JSON.stringify(updated));
      if (activeAvatar) {
        localStorage.setItem('alpha_bhai_avatar', activeAvatar);
      }
    } catch (err) {
      console.error('Local cache error:', err);
    }

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updated,
          isNewGalleryUpload: !!newVals.isNewGalleryUpload,
        }),
      });
      return response.ok;
    } catch (err) {
      console.error('Failed to lock config on server:', err);
      return false;
    }
  };

  // Reset defaults for texts, but STILL KEEP user's gallery avatar 1000% locked!
  const handleResetDefaults = async () => {
    try {
      const savedAvatar = config.avatarUrl || localStorage.getItem('alpha_bhai_avatar');
      localStorage.removeItem('alpha_bhai_config');
      if (savedAvatar) {
        localStorage.setItem('alpha_bhai_avatar', savedAvatar);
      }
      const res = await fetch('/api/reset-config', { method: 'POST' });
      const data = await res.json();
      if (data && data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-slate-100 font-sans overflow-x-hidden selection:bg-white/20 selection:text-white bg-[#000000]">
      {/* Background with Subtle Aesthetic Moonlit Ambient Particle Animation */}
      <ParticleBackground />

      {/* Main Content Area: Centered Sleek Black Glass Card */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center p-3 sm:p-5 md:p-8 my-auto">
        <TelegramLandingCard
          config={config}
          onJoinClick={handleJoin}
          onSecretAdminClick={handleSecretFooterTap}
        />
      </main>

      {/* Admin Portal Access Button: ONLY visible to you when creating/building, NEVER on published website for visitors */}
      {isBuilderMode && (
        <div className="fixed bottom-3 right-3 z-40">
          <button
            id="admin-portal-open-btn"
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            title="Admin Panel (Creator Mode Only)"
            className="p-2.5 rounded-full bg-[#160a06]/90 hover:bg-[#251009] border border-orange-500/40 text-orange-400 hover:text-orange-200 shadow-lg backdrop-blur-md transition-all active:scale-90"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Panel Modal (Device Gallery upload 1000% locked, Channel Name, etc.) */}
      {isBuilderMode && (
        <AdminPanelModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onResetDefaults={handleResetDefaults}
        />
      )}
    </div>
  );
}
