"use client";

import { useTheme } from "@/components/ThemeProvider";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

type ThemeSelectorProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeSelector({ className = "", compact = false }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`form-control w-full max-w-xs ${className}`}>
      {!compact && (
        <span className="label">
          <span className="label-text font-medium">Theme</span>
        </span>
      )}
      <select
        className="select select-bordered select-sm w-full"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        aria-label="Choose app theme"
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
