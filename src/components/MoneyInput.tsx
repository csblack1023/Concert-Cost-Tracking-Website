"use client";

type MoneyInputProps = {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: string;
  className?: string;
  id?: string;
};

export function MoneyInput({
  value,
  onChange,
  min = 0,
  step = "0.01",
  className = "",
  id,
}: MoneyInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-sm">$</span>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        className={`input input-bordered w-full pl-9 ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
