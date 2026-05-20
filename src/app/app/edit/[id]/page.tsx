import { ConcertForm } from "@/components/ConcertForm";
import { createClient } from "@/lib/supabase/server";
import { fetchConcertById, normalizeConcert } from "@/lib/fetch-concerts";
import type { Concert } from "@/types/concert";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditConcertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await fetchConcertById(supabase, id);

  if (error || !data) {
    notFound();
  }

  const concert = normalizeConcert(data as Concert);

  if (concert.user_id !== user.id) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold">Edit Concert</h2>
        <Link href="/app/concerts" className="btn btn-ghost btn-sm">
          ← Back
        </Link>
      </div>
      <p className="opacity-80 mb-6 text-sm">
        Update details, ticket types, or costs for {concert.concert_name}.
      </p>
      <ConcertForm mode="edit" concert={concert} />
    </div>
  );
}
