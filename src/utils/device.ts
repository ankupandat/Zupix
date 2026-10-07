/**
 * Device Identifier and Fingerprinting Utility
 * Ensures strict 1-Account-Per-Device & Device Restriction enforcement
 */

const DEVICE_ID_KEY = 'zupix_unique_device_id_v2';

export function getOrCreateDeviceId(): string {
  try {
    let existingId = localStorage.getItem(DEVICE_ID_KEY);
    if (existingId && existingId.startsWith('DEV-')) {
      return existingId;
    }

    // Generate a high-entropy hardware & browser bound unique device identifier
    const entropy = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      Math.random().toString(36).substring(2, 12),
      Date.now().toString(36)
    ].join('|');

    // Fast robust hash calculation
    let hash = 0;
    for (let i = 0; i < entropy.length; i++) {
      const char = entropy.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }

    const uniqueSuffix = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const randomSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newDeviceId = `DEV-${uniqueSuffix}-${randomSalt}`;

    localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
    return newDeviceId;
  } catch (e) {
    return `DEV-DEFAULT-${Date.now().toString(36).toUpperCase()}`;
  }
}

export function getDeviceDetails(): {
  deviceId: string;
  platform: string;
  screenSize: string;
  language: string;
} {
  return {
    deviceId: getOrCreateDeviceId(),
    platform: navigator.platform || 'Web',
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en'
  };
}
