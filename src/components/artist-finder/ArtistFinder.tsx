"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ArtistSearchResult,
  EventsResponse,
  SearchMode,
  StoredArtist,
  TourEvent,
} from "@/types/artist-finder";
import { CONCERT_BAR_COLORS } from "@/lib/chart-colors";
import {
  addRecentArtist,
  getFavoriteArtists,
  getRecentArtists,
  isFavoriteArtist,
  toggleFavoriteArtist,
} from "@/lib/artist-storage";
import { isValidStateName } from "@/lib/us-states";
import { StateTypeahead } from "@/components/StateTypeahead";
import { EventCard } from "@/components/artist-finder/EventCard";

export function ArtistFinder() {
  const [searchMode, setSearchMode] = useState<SearchMode>("artist");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ArtistSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ArtistSearchResult | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [stateName, setStateName] = useState("");
  const [events, setEvents] = useState<TourEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [recent, setRecent] = useState<StoredArtist[]>([]);
  const [favorites, setFavorites] = useState<StoredArtist[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const refreshStored = useCallback(() => {
    setRecent(getRecentArtists());
    setFavorites(getFavoriteArtists());
  }, []);

  useEffect(() => {
    refreshStored();
  }, [refreshStored]);

  useEffect(() => {
    if (searchMode !== "artist" || !query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      if (searchMode === "artist") setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.error) setSearchError(data.error);
        setSuggestions(data.artists ?? []);
      } catch {
        setSearchError("Could not search artists. Try again.");
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, searchMode]);

  function resetResults() {
    setEvents([]);
    setEventsError(null);
    setPage(0);
    setTotalPages(0);
    setTotalElements(0);
    setHasSearched(false);
  }

  const loadArtistEvents = useCallback(
    async (artist: ArtistSearchResult, pageNum: number) => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const params = new URLSearchParams({
          attractionId: artist.id,
          artistName: artist.name,
          page: String(pageNum),
        });
        const res = await fetch(`/api/artists/events?${params}`);
        const data: EventsResponse & { error?: string } = await res.json();
        if (data.error) {
          setEventsError(data.error);
          setEvents([]);
          return;
        }
        setEvents(data.events ?? []);
        setPage(data.page ?? pageNum);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? 0);
      } catch {
        setEventsError("Could not load upcoming shows for this artist.");
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    },
    []
  );

  const loadStateEvents = useCallback(async (state: string, pageNum: number) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const params = new URLSearchParams({
        stateName: state,
        page: String(pageNum),
      });
      const res = await fetch(`/api/artists/events-by-state?${params}`);
      const data: EventsResponse & { error?: string } = await res.json();
      if (data.error) {
        setEventsError(data.error);
        setEvents([]);
        return;
      }
      setEvents(data.events ?? []);
      setPage(data.page ?? pageNum);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch {
      setEventsError("Could not load concerts in this state.");
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  function selectArtist(artist: ArtistSearchResult) {
    setSelected(artist);
    setQuery(artist.name);
    setSuggestions([]);
    addRecentArtist(artist);
    refreshStored();
    setIsFavorite(isFavoriteArtist(artist.id));
    resetResults();
  }

  function selectStored(stored: StoredArtist) {
    selectArtist({
      id: stored.id,
      name: stored.name,
      imageUrl: stored.imageUrl,
      genre: null,
      url: null,
    });
  }

  function handleModeChange(mode: SearchMode) {
    setSearchMode(mode);
    setSearchError(null);
    resetResults();
    setSelected(null);
    setQuery("");
    setStateName("");
    setSuggestions([]);
  }

  function handleFavoriteToggle() {
    if (!selected) return;
    const nowFav = toggleFavoriteArtist(selected);
    setIsFavorite(nowFav);
    refreshStored();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEvents([]);
    setEventsError(null);
    setPage(0);
    setTotalPages(0);
    setTotalElements(0);

    if (searchMode === "artist") {
      if (selected) {
        setHasSearched(true);
        await loadArtistEvents(selected, 0);
        return;
      }
      if (query.trim().length < 2) {
        setSearchError("Enter at least 2 characters to search for an artist.");
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.error) {
          setSearchError(data.error);
          return;
        }
        if (data.artists?.length) {
          const artist = data.artists[0] as ArtistSearchResult;
          selectArtist(artist);
          setHasSearched(true);
          await loadArtistEvents(artist, 0);
        } else {
          setSearchError(`No artists found for "${query.trim()}".`);
        }
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    if (!isValidStateName(stateName)) {
      setSearchError("Choose a valid U.S. state name from the list.");
      return;
    }
    setHasSearched(true);
    await loadStateEvents(stateName, 0);
  }

  const showArtistProfile = searchMode === "artist" && selected;
  const resultsTitle =
    searchMode === "artist"
      ? `Upcoming shows for ${selected?.name ?? ""}`
      : `Upcoming shows in ${stateName}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <section className="card bg-base-100 shadow-md border border-base-300">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Find upcoming concerts</h2>
          <p className="text-sm opacity-70 -mt-2">
            Search by artist or browse all music events in a state. Powered by Ticketmaster.
          </p>

          <div className="join w-full max-w-md">
            <button
              type="button"
              className={`btn join-item flex-1 ${searchMode === "artist" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleModeChange("artist")}
            >
              Search by Artist
            </button>
            <button
              type="button"
              className={`btn join-item flex-1 ${searchMode === "state" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleModeChange("state")}
            >
              Search by State
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {searchMode === "artist" ? (
              <label className="input input-bordered flex items-center gap-2 w-full">
                <span className="opacity-50">🎤</span>
                <input
                  type="search"
                  className="grow"
                  placeholder="Type an artist name…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (selected && e.target.value !== selected.name) {
                      setSelected(null);
                      resetResults();
                    }
                  }}
                  aria-label="Artist name"
                />
              </label>
            ) : (
              <StateTypeahead
                id="finder-state"
                label="State"
                value={stateName}
                onChange={setStateName}
                placeholder="Type a state name…"
                required
              />
            )}

            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
              disabled={searchLoading || eventsLoading}
            >
              {searchLoading || eventsLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : searchMode === "artist" ? (
                "Find shows"
              ) : (
                "Find shows in state"
              )}
            </button>
          </form>

          {searchError && (
            <div className="alert alert-warning text-sm">
              <span>{searchError}</span>
            </div>
          )}

          {searchMode === "artist" && suggestions.length > 0 && !selected && (
            <ul className="menu bg-base-200 rounded-box p-2 max-h-56 overflow-y-auto">
              {suggestions.map((a, i) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => selectArtist(a)}
                    className="flex items-center gap-3"
                  >
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: CONCERT_BAR_COLORS[i % CONCERT_BAR_COLORS.length] }}
                      >
                        {a.name.charAt(0)}
                      </div>
                    )}
                    <span>
                      <span className="font-medium">{a.name}</span>
                      {a.genre && <span className="block text-xs opacity-60">{a.genre}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searchMode === "artist" && (recent.length > 0 || favorites.length > 0) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {favorites.length > 0 && (
                <div>
                  <p className="font-medium opacity-70 mb-1">Favorites</p>
                  <div className="flex flex-wrap gap-2">
                    {favorites.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="badge badge-primary badge-outline cursor-pointer"
                        onClick={() => selectStored(a)}
                      >
                        ★ {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {recent.length > 0 && (
                <div>
                  <p className="font-medium opacity-70 mb-1">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="badge badge-ghost cursor-pointer"
                        onClick={() => selectStored(a)}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {showArtistProfile && selected && (
        <section
          className="card bg-base-100 shadow-md border border-base-300 border-l-4"
          style={{ borderLeftColor: CONCERT_BAR_COLORS[0] }}
        >
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="w-28 h-28 rounded-lg object-cover shadow"
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-lg flex items-center justify-center text-3xl font-bold text-white"
                  style={{ background: CONCERT_BAR_COLORS[0] }}
                >
                  {selected.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selected.name}</h3>
                {selected.genre && <p className="text-sm opacity-80">{selected.genre}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    className={`btn btn-sm ${isFavorite ? "btn-primary" : "btn-outline"}`}
                    onClick={handleFavoriteToggle}
                  >
                    {isFavorite ? "★ Favorited" : "☆ Add favorite"}
                  </button>
                  {selected.url && (
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      Official page
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasSearched && (
          <section className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-lg font-semibold">{resultsTitle}</h3>
              {totalElements > 0 && (
                <span className="badge badge-outline">{totalElements} event(s)</span>
              )}
            </div>

            {eventsLoading && (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            )}

            {eventsError && !eventsLoading && (
              <div className="alert alert-warning">
                <span>{eventsError}</span>
              </div>
            )}

            {!eventsLoading && !eventsError && events.length === 0 && (
              <div className="hero bg-base-200 rounded-box py-10">
                <div className="hero-content text-center">
                  <p className="font-medium">No upcoming shows found</p>
                  <p className="text-sm opacity-70 max-w-md">
                    {searchMode === "artist"
                      ? `${selected?.name} has no listed Ticketmaster events right now. Try again later.`
                      : `No music events found in ${stateName}. Try another state.`}
                  </p>
                </div>
              </div>
            )}

            {!eventsLoading && events.length > 0 && (
              <>
                <ul className="divide-y divide-base-300 border border-base-300 rounded-box bg-base-100">
                  {events.map((ev, i) => (
                    <li key={ev.id} className="p-0">
                      <EventCard event={ev} accentIndex={i} />
                    </li>
                  ))}
                </ul>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      disabled={page <= 0 || eventsLoading}
                      onClick={() => {
                        if (searchMode === "artist" && selected) {
                          loadArtistEvents(selected, page - 1);
                        } else {
                          loadStateEvents(stateName, page - 1);
                        }
                      }}
                    >
                      Previous
                    </button>
                    <span className="btn btn-sm btn-ghost no-animation">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      disabled={page >= totalPages - 1 || eventsLoading}
                      onClick={() => {
                        if (searchMode === "artist" && selected) {
                          loadArtistEvents(selected, page + 1);
                        } else {
                          loadStateEvents(stateName, page + 1);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
    </div>
  );
}
