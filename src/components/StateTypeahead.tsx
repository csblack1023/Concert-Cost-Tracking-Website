"use client";

import { useEffect, useRef, useState } from "react";
import { filterStateNames } from "@/lib/us-states";

type StateTypeaheadProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (stateName: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function StateTypeahead({
  id = "state",
  label = "State",
  value,
  onChange,
  required,
  placeholder = "Start typing a state name…",
}: StateTypeaheadProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const matches = filterStateNames(input).slice(0, 8);

  return (
    <div ref={wrapRef} className="form-control w-full relative">
      <label htmlFor={id} className="label py-1">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      <input
        id={id}
        type="text"
        className="input input-bordered w-full"
        placeholder={placeholder}
        value={input}
        required={required}
        autoComplete="off"
        onChange={(e) => {
          setInput(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && input.trim() && matches.length > 0 && (
        <ul className="menu bg-base-100 border border-base-300 rounded-box shadow-lg absolute z-30 w-full mt-1 max-h-48 overflow-y-auto">
          {matches.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => {
                  setInput(name);
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <span className="label-text-alt mt-1">Full state name (e.g. Mississippi)</span>
    </div>
  );
}
