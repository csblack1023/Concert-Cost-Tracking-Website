/** U.S. states — full names stored in the app; codes used only for Ticketmaster API */

export const US_STATE_NAMES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const CODE_TO_NAME: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const NAME_TO_CODE = Object.fromEntries(
  Object.entries(CODE_TO_NAME).map(([code, name]) => [name, code])
) as Record<string, string>;

export function filterStateNames(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...US_STATE_NAMES];
  return US_STATE_NAMES.filter((name) => name.toLowerCase().includes(q));
}

export function stateNameToCode(name: string): string | null {
  return NAME_TO_CODE[name.trim()] ?? null;
}

export function stateCodeToName(code: string): string {
  return CODE_TO_NAME[code.trim().toUpperCase()] ?? code;
}

export function isValidStateName(name: string): boolean {
  return NAME_TO_CODE[name.trim()] !== undefined;
}

/** Normalize stored state (full name or abbreviation) to canonical full name */
export function normalizeStateName(state: string): string | null {
  const trimmed = state.trim();
  if (isValidStateName(trimmed)) return trimmed;
  const fromCode = stateCodeToName(trimmed);
  return isValidStateName(fromCode) ? fromCode : null;
}
