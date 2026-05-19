import { AddConcertForm } from "@/components/AddConcertForm";

export default function AddConcertPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Add Concert</h2>
      <p className="opacity-80 mb-6 text-sm">
        Fill in the details below. Your total cost is calculated automatically.
      </p>
      <AddConcertForm />
    </div>
  );
}
