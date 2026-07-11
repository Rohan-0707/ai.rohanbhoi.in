export const HOUSING_OPTIONS = [
  { label: "Apartment", value: "Apartment" },
  { label: "Independent House", value: "Independent House" },
  { label: "Ground Floor", value: "Ground Floor" },
] as const;

export type HousingOption = (typeof HOUSING_OPTIONS)[number]["value"];
