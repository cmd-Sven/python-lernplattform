import { cookies } from "next/headers";

const ADMIN_COOKIE = "pcep_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "pcep-admin-2026";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === getAdminPassword();
}

export { ADMIN_COOKIE };
