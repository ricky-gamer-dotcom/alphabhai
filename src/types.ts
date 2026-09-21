export interface LandingPageConfig {
  channelName: string;
  badgeText: string;
  topBadgeText: string;
  membersCount: string;
  telegramLink: string;
  avatarUrl: string;
  isLive: boolean;
  liveBadgeText: string;
  buttonText: string;
  autoRedirect: boolean;
  showBrowserBar: boolean;
  browserUrl: string;
  browserPlatform: string;
  footerText: string;
}

export interface PresetAvatar {
  id: string;
  name: string;
  url: string;
}
