export const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Södermalm": { lat: 59.3150, lng: 18.0700 },
  "Östermalm": { lat: 59.3380, lng: 18.0890 },
  "Norrmalm": { lat: 59.3340, lng: 18.0640 },
  "Kungsholmen": { lat: 59.3320, lng: 18.0300 },
  "Vasastan": { lat: 59.3450, lng: 18.0500 },
  "Gamla Stan": { lat: 59.3258, lng: 18.0716 },
  "Bromma": { lat: 59.3380, lng: 17.9380 },
  "Vällingby": { lat: 59.3630, lng: 17.8710 },
  "Hässelby": { lat: 59.3630, lng: 17.8330 },
  "Spånga": { lat: 59.3830, lng: 17.9020 },
  "Kista": { lat: 59.4030, lng: 17.9440 },
  "Rinkeby": { lat: 59.3880, lng: 17.9280 },
  "Tensta": { lat: 59.3940, lng: 17.9170 },
  "Hägersten": { lat: 59.2960, lng: 18.0080 },
  "Liljeholmen": { lat: 59.3100, lng: 18.0230 },
  "Aspudden": { lat: 59.3050, lng: 18.0100 },
  "Midsommarkransen": { lat: 59.3020, lng: 18.0170 },
  "Älvsjö": { lat: 59.2780, lng: 18.0100 },
  "Enskede": { lat: 59.2830, lng: 18.0700 },
  "Årsta": { lat: 59.2960, lng: 18.0510 },
  "Farsta": { lat: 59.2430, lng: 18.0930 },
  "Skarpnäck": { lat: 59.2660, lng: 18.1320 },
  "Skärholmen": { lat: 59.2760, lng: 17.9530 },
};

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(userLat: number, userLng: number, area: string): string | null {
  const coords = AREA_COORDS[area];
  if (!coords) return null;
  const km = getDistanceKm(userLat, userLng, coords.lat, coords.lng);
  return km < 1 ? `${Math.round(km * 1000)} m bort` : `${km.toFixed(1)} km bort`;
}
