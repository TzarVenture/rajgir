"use client";

/** Best-effort device location (5 s max). Resolves to {} when denied or unavailable. */
export function currentPosition(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve({});
    const timer = setTimeout(() => resolve({}), 5000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve({});
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 }
    );
  });
}
