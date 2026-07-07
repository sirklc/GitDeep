export interface Country {
  code: string;
  dial: string;
}

// Curated list, Turkey pinned first since it's the primary market; rest
// covers the countries most likely to sign up. ISO 3166-1 alpha-2 codes.
export const COUNTRIES: Country[] = [
  { code: "TR", dial: "+90" },
  { code: "US", dial: "+1" },
  { code: "GB", dial: "+44" },
  { code: "DE", dial: "+49" },
  { code: "FR", dial: "+33" },
  { code: "NL", dial: "+31" },
  { code: "ES", dial: "+34" },
  { code: "IT", dial: "+39" },
  { code: "PL", dial: "+48" },
  { code: "SE", dial: "+46" },
  { code: "CH", dial: "+41" },
  { code: "AT", dial: "+43" },
  { code: "BE", dial: "+32" },
  { code: "PT", dial: "+351" },
  { code: "GR", dial: "+30" },
  { code: "RO", dial: "+40" },
  { code: "BG", dial: "+359" },
  { code: "AZ", dial: "+994" },
  { code: "GE", dial: "+995" },
  { code: "AE", dial: "+971" },
  { code: "SA", dial: "+966" },
  { code: "QA", dial: "+974" },
  { code: "EG", dial: "+20" },
  { code: "IN", dial: "+91" },
  { code: "PK", dial: "+92" },
  { code: "CA", dial: "+1" },
  { code: "AU", dial: "+61" },
  { code: "JP", dial: "+81" },
  { code: "KR", dial: "+82" },
  { code: "CN", dial: "+86" },
  { code: "BR", dial: "+55" },
  { code: "MX", dial: "+52" },
  { code: "RU", dial: "+7" },
  { code: "UA", dial: "+380" },
];

export function countryLabel(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
