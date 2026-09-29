export const DEMO_STAFF = {
  email: "staff@vigyanshaala.com",
  password: "Kalpana@2026",
  name: "Program team",
};

export const SESSION_COOKIE = "vs_staff_session";

function envOrDemo(value: string | undefined, fallback: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || fallback;
}

export function getStaffCredentials() {
  return {
    email: envOrDemo(process.env.STAFF_EMAIL, DEMO_STAFF.email),
    password: envOrDemo(process.env.STAFF_PASSWORD, DEMO_STAFF.password),
    name: envOrDemo(process.env.STAFF_NAME, DEMO_STAFF.name),
  };
}

function sameAccount(
  email: string,
  password: string,
  account: { email: string; password: string },
) {
  return (
    email.trim().toLowerCase() === account.email.trim().toLowerCase() &&
    password === account.password
  );
}

/** Printed demo staff always works, even if Vercel env vars are blank or different. */
export function credentialsMatch(email: string, password: string) {
  return sameAccount(email, password, getStaffCredentials()) || sameAccount(email, password, DEMO_STAFF);
}
