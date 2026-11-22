// PERMANENT SYSTEM IDENTIFIERS CONFIGURATION
// Sensitive credentials (passwords, JWT secrets) are stored exclusively on the server in environment variables.
// These public descriptors define system roles and assigned account identifiers.

export const PERMANENT_ADMIN_EMAILS = [
  (process.env.ADMIN_PERMANENT_EMAIL || "admin@nimza.com").trim().toLowerCase(),
  "admin@nimza.com",
  "admin@nimaz.com",
];

export const PERMANENT_CHEF_EMAILS = [
  (process.env.CHEF_PERMANENT_EMAIL || "chef@nimza.com").trim().toLowerCase(),
  "chef@nimza.com",
  "chef@nimaz.com",
];

export const PERMANENT_CREDENTIALS = {
  admin: {
    email: (process.env.ADMIN_PERMANENT_EMAIL || "admin@nimza.com").trim().toLowerCase(),
    role: "admin" as const,
    name: "Executive Administrator",
  },
  chef: {
    email: (process.env.CHEF_PERMANENT_EMAIL || "chef@nimza.com").trim().toLowerCase(),
    role: "chef" as const,
    name: "Executive Chef Elias Varga",
  },
} as const;

/**
 * Check if an email belongs to a protected permanent system account.
 */
export function isPermanentSystemEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return PERMANENT_ADMIN_EMAILS.includes(clean) || PERMANENT_CHEF_EMAILS.includes(clean);
}
