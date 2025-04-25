// utils/phoneFormatter.ts
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Argentine numbers
  if (cleaned.startsWith("549")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("9")) {
    return `+54${cleaned}`;
  }
  if (cleaned.startsWith("54")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("11") && cleaned.length === 10) {
    return `+54${cleaned}`;
  }

  return `+${cleaned}`;
};
