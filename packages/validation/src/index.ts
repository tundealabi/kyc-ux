import { z } from "zod";

/** Nigerian BVN: exactly 11 digits */
export const bvnSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "BVN must be exactly 11 digits");

/** Nigerian NIN: exactly 11 digits */
export const ninSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "NIN must be exactly 11 digits");

export type CacRegistrationType = "registered_company" | "business_name";

/**
 * Heuristic CAC number detection.
 * - RC numbers are typically numeric (often 6–8 digits)
 * - BN numbers often include a BN prefix or different patterns
 * Returns null when ambiguous.
 */
export function detectCacRegistrationType(
  raw: string,
): CacRegistrationType | null {
  const value = raw.trim().toUpperCase().replace(/\s+/g, "");

  if (!value) return null;

  if (value.startsWith("BN") || value.startsWith("BN-")) {
    return "business_name";
  }

  if (value.startsWith("RC") || value.startsWith("RC-")) {
    return "registered_company";
  }

  // Pure numeric → treat as registered company (RC)
  if (/^\d{5,8}$/.test(value)) {
    return "registered_company";
  }

  // BN-style alphanumeric without clear prefix
  if (/^[A-Z0-9-]{6,14}$/.test(value) && /[A-Z]/.test(value)) {
    return "business_name";
  }

  return null;
}

export function normalizeCacNumber(
  raw: string,
  type: CacRegistrationType,
): string {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  const withoutPrefix = cleaned.replace(/^(RC|BN)-?/, "");

  if (type === "registered_company") {
    return withoutPrefix;
  }

  return withoutPrefix;
}

export const cacNumberSchema = z
  .string()
  .trim()
  .min(5, "Enter a valid CAC registration number")
  .max(14, "CAC registration number is too long")
  .regex(/^[A-Za-z0-9-]+$/, "Only letters, numbers, and hyphens are allowed");

export function isValidCacNumber(
  raw: string,
  type: CacRegistrationType,
): boolean {
  const normalized = normalizeCacNumber(raw, type);
  if (type === "registered_company") {
    return /^\d{5,8}$/.test(normalized);
  }
  // Business name numbers are less uniform; require alphanumeric length
  return /^[A-Z0-9]{5,12}$/i.test(normalized);
}

export const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, "Date of birth cannot be in the future")
  .refine((value) => {
    const date = new Date(value);
    const min = new Date();
    min.setFullYear(min.getFullYear() - 120);
    return date >= min;
  }, "Enter a valid date of birth");

export const addressSchema = z.object({
  street: z.string().trim().min(5, "Enter a full street address"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const personalIdentitySchema = z.object({
  bvn: bvnSchema,
  dateOfBirth: dateOfBirthSchema,
});

export const personalNinSchema = z.object({
  nin: ninSchema,
});

export const personalAddressSchema = addressSchema;

export const corporateRegistrationSchema = z
  .object({
    registrationType: z.enum(["registered_company", "business_name"]),
    cacNumber: cacNumberSchema,
  })
  .superRefine((data, ctx) => {
    if (!isValidCacNumber(data.cacNumber, data.registrationType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cacNumber"],
        message:
          data.registrationType === "registered_company"
            ? "RC number should be 5–8 digits"
            : "Enter a valid business-name registration number",
      });
    }
  });

export const principalIdentitySchema = personalIdentitySchema;

/** Live field helpers for UI (digit count / format as user types) */
export function getBvnFieldState(value: string): {
  digits: string;
  isComplete: boolean;
  isValid: boolean;
  message?: string;
} {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const isComplete = digits.length === 11;
  const isValid = /^\d{11}$/.test(digits);

  if (!digits.length) {
    return { digits, isComplete: false, isValid: false };
  }

  if (!isComplete) {
    return {
      digits,
      isComplete: false,
      isValid: false,
      message: `${digits.length}/11 digits`,
    };
  }

  return {
    digits,
    isComplete: true,
    isValid: true,
    message: "Looks good",
  };
}

export function getNinFieldState(value: string) {
  return getBvnFieldState(value);
}

export function getCacFieldState(
  value: string,
  type: CacRegistrationType,
): {
  display: string;
  detectedType: CacRegistrationType | null;
  isValid: boolean;
  message?: string;
} {
  const detectedType = detectCacRegistrationType(value);
  const effectiveType = type;
  const display = normalizeCacNumber(value, effectiveType);
  const isValid = isValidCacNumber(value, effectiveType);

  if (!value.trim()) {
    return { display, detectedType, isValid: false };
  }

  if (isValid) {
    return {
      display,
      detectedType,
      isValid: true,
      message: "Looks good",
    };
  }

  return {
    display,
    detectedType,
    isValid: false,
    message:
      effectiveType === "registered_company"
        ? "RC number should be 5–8 digits"
        : "Enter a valid business-name number",
  };
}
