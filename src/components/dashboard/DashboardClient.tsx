"use client";

import dynamic from "next/dynamic";
import type { Concert } from "@/types/concert";

const UsConcertMap = dynamic(
  () => import("@/components/dashboard/UsConcertMap").then((m) => m.UsConcertMap),
  {
    loading: () => (
      <div className="card bg-base-100 shadow-md border border-base-300 mt-8">
        <div className="card-body flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    ),
  }
);

const DashboardCharts = dynamic(
  () => import("@/components/DashboardCharts").then((m) => m.DashboardCharts),
  {
    loading: () => (
      <div className="flex justify-center py-12 mt-8">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    ),
  }
);

type DashboardClientProps = {
  concerts: Concert[];
};

export function DashboardClient({ concerts }: DashboardClientProps) {
  return (
    <>
      <UsConcertMap concerts={concerts} />
      <DashboardCharts concerts={concerts} />
    </>
  );
}
