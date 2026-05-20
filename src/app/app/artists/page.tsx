import { ArtistFinder } from "@/components/artist-finder/ArtistFinder";

export default function ArtistFinderPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Artist Finder</h2>
      <p className="opacity-80 mb-6 text-sm max-w-2xl">
        Search for any artist, pick a U.S. state, and see upcoming shows. Save favorites,
        then track a concert in your cost log with one click.
      </p>
      <ArtistFinder />
    </div>
  );
}
