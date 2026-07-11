export type ParsedPhone = {
  countryCode: string;
  phoneNumber: string;
};

export function parsePhoneForInterakt(
  rawPhone: string,
  defaultCountryCode = process.env.INTERAKT_DEFAULT_COUNTRY_CODE || "+91",
): ParsedPhone {
  const digitsOnly = rawPhone.replace(/[^\d+]/g, "");

  if (!digitsOnly) {
    throw new Error("Phone number is required");
  }

  if (digitsOnly.startsWith("+")) {
    const normalized = digitsOnly.slice(1);

    if (normalized.startsWith("91") && normalized.length === 12) {
      return {
        countryCode: "+91",
        phoneNumber: normalized.slice(2),
      };
    }

    if (normalized.length > 10) {
      return {
        countryCode: `+${normalized.slice(0, normalized.length - 10)}`,
        phoneNumber: normalized.slice(-10),
      };
    }
  }

  const withoutPlus = digitsOnly.replace(/^\+/, "");

  if (withoutPlus.startsWith("91") && withoutPlus.length === 12) {
    return {
      countryCode: "+91",
      phoneNumber: withoutPlus.slice(2),
    };
  }

  if (withoutPlus.startsWith("0") && withoutPlus.length === 11) {
    return {
      countryCode: defaultCountryCode,
      phoneNumber: withoutPlus.slice(1),
    };
  }

  if (withoutPlus.length === 10) {
    return {
      countryCode: defaultCountryCode,
      phoneNumber: withoutPlus,
    };
  }

  throw new Error("Enter a valid 10-digit mobile number");
}
