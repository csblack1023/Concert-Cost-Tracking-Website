import type { ArtistSearchResult, StoredArtist } from "@/types/artist-finder";

const RECENT_KEY = "concert-tracker-recent-artists";
const FAVORITES_KEY = "concert-tracker-favorite-artists";
const MAX_RECENT = 8;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getRecentArtists(): StoredArtist[] {
  return read<StoredArtist>(RECENT_KEY);
}

export function addRecentArtist(artist: ArtistSearchResult) {
  const entry: StoredArtist = {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    searchedAt: new Date().toISOString(),
  };
  const list = getRecentArtists().filter((a) => a.id !== artist.id);
  list.unshift(entry);
  write(RECENT_KEY, list.slice(0, MAX_RECENT));
}

export function getFavoriteArtists(): StoredArtist[] {
  return read<StoredArtist>(FAVORITES_KEY);
}

export function toggleFavoriteArtist(artist: ArtistSearchResult): boolean {
  const favorites = getFavoriteArtists();
  const exists = favorites.some((a) => a.id === artist.id);
  if (exists) {
    write(
      FAVORITES_KEY,
      favorites.filter((a) => a.id !== artist.id)
    );
    return false;
  }
  const entry: StoredArtist = {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    searchedAt: new Date().toISOString(),
  };
  write(FAVORITES_KEY, [entry, ...favorites].slice(0, 20));
  return true;
}

export function isFavoriteArtist(id: string): boolean {
  return getFavoriteArtists().some((a) => a.id === id);
}
