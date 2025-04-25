// utils/phoneFormatter.ts
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Argentine numbers
  if (cleaned.startsWith("549")) {
    // Mobile format
    return cleaned;
  }
  if (cleaned.startsWith("54")) {
    // Country code only
    return cleaned;
  }
  if (cleaned.startsWith("9")) {
    // Local mobile
    return `54${cleaned}`;
  }
  if (cleaned.startsWith("11") && cleaned.length === 10) {
    // Buenos Aires landline
    return `54${cleaned}`;
  }

  return cleaned; // Return cleaned number without + prefix
};
