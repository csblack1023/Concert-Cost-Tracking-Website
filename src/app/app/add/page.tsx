import { ConcertForm } from "@/components/ConcertForm";

export default async function AddConcertPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const prefill = {
    artist: params.artist,
    concert_name: params.concert_name,
    venue: params.venue,
    city: params.city,
    state: params.state,
    concert_date: params.concert_date,
  };

  const hasPrefill = Object.values(prefill).some(Boolean);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Add Concert</h2>
      <p className="opacity-80 mb-6 text-sm">
        {hasPrefill
          ? "We pre-filled details from Artist Finder. Add your costs and save."
          : "Add ticket types with cost per ticket and quantity. All amounts are in USD."}
      </p>
      <ConcertForm mode="create" prefill={hasPrefill ? prefill : undefined} />
    </div>
  );
}
