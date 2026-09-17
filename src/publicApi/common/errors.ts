export const errors = {
  missingApiKey: { code: "MISSING_API_KEY", message: "x-api-key header is required" },
  invalidApiKey: { code: "INVALID_API_KEY", message: "Invalid API key" },
  configError: { code: "CONFIG_ERROR", message: "Public API keys are not configured" },
  missingEmail: { code: "MISSING_EMAIL", message: "email query parameter is required" },
  invalidQuery: { code: "INVALID_QUERY", message: "One or more query parameters are invalid" },
  userNotFound: {
    code: "USER_NOT_FOUND",
    message: "The provided email is not registered for this company",
  },
  internal: { code: "INTERNAL_ERROR", message: "Internal server error" },
};
