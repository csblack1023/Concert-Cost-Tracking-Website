/** Label + input row with fixed label width so inputs line up vertically */
export function AlignedField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-3 sm:items-center">
      <label htmlFor={htmlFor} className="label sm:justify-end py-0 sm:py-2">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div>
        {children}
        {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
