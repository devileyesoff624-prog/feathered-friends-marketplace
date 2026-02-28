/**
 * Sanitizes database/API errors to prevent leaking internal details to users.
 */
export const sanitizeError = (error: any): string => {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = error?.code;
  const errorMap: Record<string, string> = {
    "23505": "This item already exists.",
    "23503": "Invalid reference. Please check your input.",
    "23514": "Input validation failed. Please check your data.",
    "42501": "You don't have permission to perform this action.",
    "PGRST116": "Item not found.",
    "PGRST301": "Request failed. Please try again.",
  };

  if (code && errorMap[code]) return errorMap[code];

// Generic fallback — never expose raw error.message
  return "Something went wrong. Please try again.";
};

/**
 * Sanitizes authentication errors to prevent leaking internal details.
 */
export const sanitizeAuthError = (error: any): string => {
  const message = error?.message?.toLowerCase() || "";

  if (message.includes("already registered")) return "This email is already in use.";
  if (message.includes("invalid") || message.includes("credentials")) return "Invalid email or password.";
  if (message.includes("rate limit")) return "Too many attempts. Please try again later.";
  if (message.includes("email not confirmed")) return "Please verify your email address.";
  if (message.includes("password")) return "Password does not meet requirements.";

  return "Authentication failed. Please try again.";
};
