"use client";

import { useEffect, useMemo, useState } from "react";
import type { Feature, FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { geoAlbersUsa, geoPath } from "d3-geo";
import type { Concert } from "@/types/concert";
import { formatCurrency, formatDate, totalCost } from "@/lib/concert-utils";
import { CONCERT_BAR_COLORS } from "@/lib/chart-colors";
import { normalizeStateName } from "@/lib/us-states";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const MAP_WIDTH = 800;
const MAP_HEIGHT = 500;

type StateFeature = Feature & {
  properties: { name: string };
};

type UsConcertMapProps = {
  concerts: Concert[];
};

export function UsConcertMap({ concerts }: UsConcertMapProps) {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load map data");
        return res.json();
      })
      .then((topology: Topology) => {
        if (cancelled) return;
        const collection = feature(
          topology,
          topology.objects.states as Parameters<typeof feature>[1]
        ) as FeatureCollection;
        setFeatures(collection.features as StateFeature[]);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Map could not be loaded. Check your internet connection.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const concertsByState = useMemo(() => {
    const map = new Map<string, Concert[]>();
    for (const c of concerts) {
      const name = normalizeStateName(c.state);
      if (!name) continue;
      const list = map.get(name) ?? [];
      list.push(c);
      map.set(name, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(b.concert_date).getTime() - new Date(a.concert_date).getTime()
      );
    }
    return map;
  }, [concerts]);

  const statesWithConcerts = useMemo(
    () => new Set(concertsByState.keys()),
    [concertsByState]
  );

  const projection = useMemo(() => {
    const proj = geoAlbersUsa();
    if (features.length === 0) {
      return proj.translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]).scale(900);
    }
    return proj.fitSize([MAP_WIDTH, MAP_HEIGHT], {
      type: "FeatureCollection",
      features,
    } as FeatureCollection);
  }, [features]);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const selectedConcerts = selectedState ? (concertsByState.get(selectedState) ?? []) : [];

  if (concerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md border border-base-300 mt-8">
        <div className="card-body">
          <h3 className="card-title text-base">Concerts by state</h3>
          <p className="text-sm opacity-70">Add a concert to see which states you have visited on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md border border-base-300 mt-8">
      <div className="card-body">
        <h3 className="card-title text-base">Concerts by state</h3>
        <p className="text-sm opacity-70 -mt-1">
          Highlighted states have logged concerts. Click a state for details.
        </p>

        {loadError ? (
          <div className="alert alert-warning text-sm mt-2">
            <span>{loadError}</span>
          </div>
        ) : features.length === 0 ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 mt-2">
            <div className="flex-1 min-w-0 overflow-x-auto">
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="w-full max-h-[420px]"
                role="img"
                aria-label="Map of the United States"
              >
                {features.map((f) => {
                  const stateName = f.properties?.name ?? "";
                  const hasConcerts = statesWithConcerts.has(stateName);
                  const isSelected = selectedState === stateName;
                  const d = pathGenerator(f);
                  if (!d) return null;
                  return (
                    <path
                      key={stateName}
                      d={d}
                      fill={
                        isSelected
                          ? CONCERT_BAR_COLORS[2]
                          : hasConcerts
                            ? CONCERT_BAR_COLORS[0]
                            : "oklch(var(--b3))"
                      }
                      stroke="oklch(var(--b1))"
                      strokeWidth={isSelected ? 2 : 0.75}
                      opacity={hasConcerts ? 1 : 0.55}
                      className={hasConcerts ? "cursor-pointer transition-opacity hover:opacity-90" : ""}
                      onClick={() => {
                        if (hasConcerts) {
                          setSelectedState((prev) => (prev === stateName ? null : stateName));
                        }
                      }}
                    >
                      <title>{stateName}</title>
                    </path>
                  );
                })}
              </svg>
            </div>

            <div className="lg:w-80 shrink-0">
              {selectedState && selectedConcerts.length > 0 ? (
                <div className="bg-base-200/80 rounded-box border border-base-300 p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h4 className="font-semibold">{selectedState}</h4>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Close"
                      onClick={() => setSelectedState(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedConcerts.map((c) => (
                      <li
                        key={c.id}
                        className="text-sm border-b border-base-300 pb-3 last:border-0 last:pb-0"
                      >
                        <p className="font-medium">{c.artist}</p>
                        <p className="mt-1">
                          <span className="opacity-70">Total cost: </span>
                          {formatCurrency(totalCost(c))}
                        </p>
                        <p>
                          <span className="opacity-70">Date: </span>
                          {formatDate(c.concert_date)}
                        </p>
                        <p>
                          <span className="opacity-70">Rating: </span>
                          {c.fun_rating} / 10
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-base-200/50 rounded-box border border-dashed border-base-300 p-6 text-center text-sm opacity-70">
                  Click a highlighted state to see your concerts there.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
