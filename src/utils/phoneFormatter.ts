// utils/phoneFormatter.ts
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle WhatsApp's format (5491122775850 → 5411522775850)
  if (cleaned.startsWith("549")) {
    return `54${cleaned.substring(3)}`; // Remove the 9, keep country code
  }

  // Handle already correct format
  if (cleaned.startsWith("5411")) {
    return cleaned;
  }

  // Default case
  return `5411${cleaned.slice(-8)}`; // Force BA area code + last 8 digits
};
