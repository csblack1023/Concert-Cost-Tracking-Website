import { LoginForm } from "@/components/LoginForm";
import { ThemeSelector } from "@/components/ThemeSelector";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authFailed = params.error === "auth";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4 max-w-6xl mx-auto w-full">
        <ThemeSelector />
      </div>

      <div className="hero flex-1">
        <div className="hero-content flex-col lg:flex-row-reverse gap-10 w-full max-w-5xl px-4 pb-12">
          <div className="text-center lg:text-left flex-1">
            <div className="inline-block mb-4 text-5xl" aria-hidden>
              🎸
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Concert Cost Tracker
            </h1>
            <p className="py-4 text-lg opacity-90 max-w-md mx-auto lg:mx-0">
              Remember every show. Know what you spent. See which concerts gave you the most fun
              for your money.
            </p>
            <ul className="text-sm space-y-2 opacity-80 text-left max-w-sm mx-auto lg:mx-0">
              <li>✓ Log tickets, travel, food, merch, and more</li>
              <li>✓ Rate how fun each night was</li>
              <li>✓ Dashboard with charts and stats</li>
            </ul>
          </div>
          {authFailed && (
            <div className="alert alert-error max-w-md w-full mb-4">
              <span>Sign-in link expired or failed. Try logging in with your email and password.</span>
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
