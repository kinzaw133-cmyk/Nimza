// PERMANENT SYSTEM CREDENTIALS CONFIGURATION
// These credentials are fixed, permanent, and cannot be changed by any user.
// They protect the Admin Panel and Chef Kitchen Pass suites.

export const PERMANENT_CREDENTIALS = {
  admin: {
    email: (process.env.ADMIN_PERMANENT_EMAIL || "admin@nimza.com").trim().toLowerCase(),
    password: process.env.ADMIN_PERMANENT_PASSWORD || "NimzaAdmin@2026!",
    role: "admin" as const,
    name: "Executive Administrator",
  },
  chef: {
    email: (process.env.CHEF_PERMANENT_EMAIL || "chef@nimza.com").trim().toLowerCase(),
    password: process.env.CHEF_PERMANENT_PASSWORD || "NimzaChef@2026!",
    role: "chef" as const,
    name: "Executive Chef Elias Varga",
  },
} as const;

/**
 * Strict verification for Administrator credentials
 * Returns true only if email and password match the permanent admin credentials.
 */
export function verifyAdminCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;
  return (
    email.trim().toLowerCase() === PERMANENT_CREDENTIALS.admin.email &&
    password === PERMANENT_CREDENTIALS.admin.password
  );
}

/**
 * Strict verification for Chef credentials
 * Returns true only if email and password match the permanent chef credentials.
 */
export function verifyChefCredentials(email?: string, password?: string): boolean {
  if (!email || !password) return false;
  return (
    email.trim().toLowerCase() === PERMANENT_CREDENTIALS.chef.email &&
    password === PERMANENT_CREDENTIALS.chef.password
  );
}

/**
 * Check if an email belongs to a protected permanent system account.
 */
export function isPermanentSystemEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === PERMANENT_CREDENTIALS.admin.email ||
    clean === PERMANENT_CREDENTIALS.chef.email
  );
}
