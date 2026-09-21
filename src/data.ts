import { LandingPageConfig, PresetAvatar } from './types';

export const DEFAULT_CONFIG: LandingPageConfig = {
  channelName: 'ALPHA BHAI',
  badgeText: 'OFFICIAL TELEGRAM CHANNEL',
  topBadgeText: 'TOP',
  membersCount: '28.5K+',
  telegramLink: 'https://t.me/+mVO1R7zmazwyMDg9',
  // Photo matching the screenshot's sports car & guy in sunglasses
  avatarUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  isLive: true,
  liveBadgeText: 'LIVE',
  buttonText: 'JOIN NOW',
  autoRedirect: false, // Auto-redirect disabled
  showBrowserBar: false,
  browserUrl: '',
  browserPlatform: '',
  footerText: '© 2026 JACK AGENCY',
};

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'screenshot-match',
    name: 'Sports Car & Streetwear (Screenshot Match)',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'supercar-lifestyle',
    name: 'Luxury Dark Coupe',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'dark-streetwear',
    name: 'Urban Monochrome',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'trader-pro',
    name: 'Alpha Trader Style',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  },
];
