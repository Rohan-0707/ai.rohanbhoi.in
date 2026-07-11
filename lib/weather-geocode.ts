export type ResolvedPlace = {
  displayName: string;
  area: string;
  district: string;
  state: string;
  pincode: string | null;
  latitude: number;
  longitude: number;
  queryType: "pincode" | "place";
};

const PINCODE_PATTERN = /^\d{6}$/;
const FETCH_TIMEOUT_MS = 8000;
const NOMINATIM_USER_AGENT = "JalVayuAI/1.0 (monsoon-preparedness)";

type PostalPincodeOffice = {
  Name?: string;
  District?: string;
  State?: string;
  Block?: string;
};

type PostalPincodeResponse = Array<{
  Status?: string;
  PostOffice?: PostalPincodeOffice[];
}>;

type OpenMeteoGeocodeResult = {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    admin2?: string;
    country?: string;
    country_code?: string;
  }>;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
  address?: {
    state?: string;
    state_district?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
  };
};

type GeocodeHit = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
};

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function isPincodeQuery(query: string): boolean {
  return PINCODE_PATTERN.test(query.trim());
}

function uniqueQueries(queries: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();

  return queries
    .map((query) => query?.trim())
    .filter((query): query is string => Boolean(query))
    .filter((query) => {
      const key = query.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

async function geocodeWithOpenMeteo(searchName: string): Promise<GeocodeHit | null> {
  const params = new URLSearchParams({
    name: searchName,
    count: "8",
    language: "en",
    format: "json",
    country: "IN",
  });

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as OpenMeteoGeocodeResult;
  const results = payload.results ?? [];

  const indiaMatch =
    results.find(
      (item) => item.country === "India" || item.country_code === "IN",
    ) ?? results[0];

  if (!indiaMatch) {
    return null;
  }

  return {
    name: indiaMatch.name,
    latitude: indiaMatch.latitude,
    longitude: indiaMatch.longitude,
    admin1: indiaMatch.admin1,
    admin2: indiaMatch.admin2,
  };
}

async function geocodeWithNominatim(searchName: string): Promise<GeocodeHit | null> {
  const params = new URLSearchParams({
    q: searchName.includes("India") ? searchName : `${searchName}, India`,
    format: "json",
    limit: "5",
    countrycodes: "in",
  });

  const response = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];

  if (!match) {
    return null;
  }

  const latitude = Number.parseFloat(match.lat);
  const longitude = Number.parseFloat(match.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const address = match.address;

  return {
    name:
      match.name ||
      address?.town ||
      address?.city ||
      address?.village ||
      searchName.split(",")[0]?.trim() ||
      searchName,
    latitude,
    longitude,
    admin1: address?.state,
    admin2: address?.state_district || address?.county,
  };
}

async function geocodeSearchQueries(
  queries: string[],
): Promise<GeocodeHit | null> {
  for (const query of queries) {
    const openMeteoHit = await geocodeWithOpenMeteo(query);

    if (openMeteoHit) {
      return openMeteoHit;
    }
  }

  for (const query of queries) {
    const nominatimHit = await geocodeWithNominatim(query);

    if (nominatimHit) {
      return nominatimHit;
    }
  }

  return null;
}

function buildResolvedPlace(
  hit: GeocodeHit,
  meta: {
    displayName: string;
    area: string;
    district: string;
    state: string;
    pincode: string | null;
    queryType: "pincode" | "place";
  },
): ResolvedPlace {
  return {
    displayName: meta.displayName,
    area: meta.area,
    district: meta.district,
    state: meta.state,
    pincode: meta.pincode,
    latitude: hit.latitude,
    longitude: hit.longitude,
    queryType: meta.queryType,
  };
}

async function resolveIndianPincode(pincode: string): Promise<ResolvedPlace> {
  const response = await fetchWithTimeout(
    `https://api.postalpincode.in/pincode/${pincode}`,
  );

  if (!response.ok) {
    throw new Error("Could not resolve that PIN code");
  }

  const payload = (await response.json()) as PostalPincodeResponse;
  const entry = payload[0];

  if (entry?.Status !== "Success" || !entry.PostOffice?.length) {
    throw new Error("PIN code not found. Try a nearby area name instead.");
  }

  const office = entry.PostOffice[0];
  const area = office.Name?.trim() || pincode;
  const district = office.District?.trim() || area;
  const state = office.State?.trim() || "Maharashtra";
  const block = office.Block?.trim();

  const queries = uniqueQueries([
    `${area}, ${district}, ${state}`,
    block ? `${block}, ${district}, ${state}` : undefined,
    `${district}, ${state}`,
    state,
  ]);

  const hit = await geocodeSearchQueries(queries);

  if (!hit) {
    throw new Error(
      `Could not map PIN ${pincode} to coordinates. Try the nearest town name (e.g. ${district}).`,
    );
  }

  return buildResolvedPlace(hit, {
    displayName: `${area}, ${district}`,
    area,
    district,
    state,
    pincode,
    queryType: "pincode",
  });
}

async function resolvePlaceName(query: string): Promise<ResolvedPlace> {
  const normalized = query.includes("India") ? query : `${query}, India`;

  const queries = uniqueQueries([
    query,
    normalized,
    query.split(",")[0]?.trim(),
  ]);

  const hit = await geocodeSearchQueries(queries);

  if (!hit) {
    throw new Error(
      "Location not found. Enter a city, neighborhood, or 6-digit PIN code.",
    );
  }

  const district = hit.admin2 ?? hit.name;
  const state = hit.admin1 ?? "India";

  return buildResolvedPlace(hit, {
    displayName: hit.admin1 ? `${hit.name}, ${hit.admin1}` : hit.name,
    area: hit.name,
    district,
    state,
    pincode: null,
    queryType: "place",
  });
}

export async function resolvePlaceQuery(rawQuery: string): Promise<ResolvedPlace> {
  const query = rawQuery.trim();

  if (!query) {
    throw new Error("Enter a place name or PIN code");
  }

  if (query.length > 120) {
    throw new Error("Search query is too long");
  }

  if (isPincodeQuery(query)) {
    return resolveIndianPincode(query);
  }

  return resolvePlaceName(query);
}
