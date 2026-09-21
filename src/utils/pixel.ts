declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __metaPixelPageViewFired?: boolean;
    __metaPixelSubscribeFired?: boolean;
  }
}

export const META_PIXEL_ID = '1061117969965797';

// In-memory module-level lock (strictly per runtime)
let isSubscribeFiredInMemory = false;
let isPageViewFiredInMemory = false;

/**
 * Check if Subscribe has already been fired in any storage / memory layer
 */
export function hasSubscribeAlreadyFired(): boolean {
  if (typeof window === 'undefined') return false;

  if (isSubscribeFiredInMemory) return true;
  if (window.__metaPixelSubscribeFired) return true;

  try {
    if (sessionStorage.getItem('alpha_pixel_sub_fired') === '1') return true;
    if (localStorage.getItem('alpha_pixel_sub_fired') === '1') return true;
  } catch (e) {
    // Storage access fallback
  }

  return false;
}

/**
 * Manually fires the Meta Pixel PageView event strictly ONCE.
 * 100% Guarded against duplicates and re-renders.
 */
export function firePixelPageViewOnce() {
  if (typeof window === 'undefined') return;

  if (isPageViewFiredInMemory || window.__metaPixelPageViewFired) {
    return;
  }

  try {
    if (sessionStorage.getItem('alpha_pixel_pv_fired') === '1') {
      return;
    }
  } catch (e) {}

  isPageViewFiredInMemory = true;
  window.__metaPixelPageViewFired = true;
  try {
    sessionStorage.setItem('alpha_pixel_pv_fired', '1');
  } catch (e) {}

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView');
    } catch (e) {
      console.warn('Error firing PageView pixel:', e);
    }
  }
}

/**
 * Manually fires the Meta Pixel Subscribe event strictly ONCE.
 * 1000% Multi-Layer Bulletproof Lock:
 * 1. Module Memory Lock
 * 2. Window Object Lock
 * 3. SessionStorage Lock
 * 4. LocalStorage Lock
 * 5. Meta Server Deduplication with deterministic eventID
 */
export function firePixelSubscribeOnce() {
  if (typeof window === 'undefined') return;

  // STRICT 1-TIME CHECK
  if (hasSubscribeAlreadyFired()) {
    console.log('[Meta Pixel] Subscribe already fired - 100% locked & blocked duplicate.');
    return;
  }

  // ATOMIC LOCK: Set all locks BEFORE calling fbq to prevent race conditions
  isSubscribeFiredInMemory = true;
  window.__metaPixelSubscribeFired = true;

  try {
    sessionStorage.setItem('alpha_pixel_sub_fired', '1');
    localStorage.setItem('alpha_pixel_sub_fired', '1');
  } catch (e) {}

  // Stable eventID so even on Facebook's servers, duplicates are automatically merged
  const eventId = 'sub_single_' + META_PIXEL_ID;

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Subscribe', {}, { eventID: eventId });
      console.log('[Meta Pixel] Subscribe MANUALLY FIRED STRICTLY 1 TIME (eventID:', eventId, ')');
    } catch (e) {
      console.warn('Error firing Subscribe pixel:', e);
    }
  }
}

/**
 * Admin utility to reset locks when testing in Facebook Events Manager
 */
export function resetPixelTestLocks() {
  isSubscribeFiredInMemory = false;
  isPageViewFiredInMemory = false;
  if (typeof window !== 'undefined') {
    window.__metaPixelSubscribeFired = false;
    window.__metaPixelPageViewFired = false;
    try {
      sessionStorage.removeItem('alpha_pixel_sub_fired');
      localStorage.removeItem('alpha_pixel_sub_fired');
      sessionStorage.removeItem('alpha_pixel_pv_fired');
    } catch (e) {}
  }
}
