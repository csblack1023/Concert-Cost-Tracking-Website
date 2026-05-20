export type ArtistSearchResult = {
  id: string;
  name: string;
  imageUrl: string | null;
  genre: string | null;
  url: string | null;
};

export type TourEvent = {
  id: string;
  name: string;
  artistName: string;
  venue: string;
  city: string;
  state: string;
  dateTime: string;
  dateLabel: string;
  ticketUrl: string | null;
  minPrice: number | null;
};

export type EventsResponse = {
  events: TourEvent[];
  page: number;
  totalPages: number;
  totalElements: number;
};

export type StoredArtist = {
  id: string;
  name: string;
  imageUrl: string | null;
  searchedAt: string;
};

export type SearchMode = "artist" | "state";
