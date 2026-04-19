import { headers, cookies } from "next/headers";

export async function currentAccountId(): Promise<string> {
  try {
    const h = await headers();
    const fromHeader = h.get("x-xake-user-id");
    if (fromHeader) return fromHeader;
    const c = await cookies();
    const fromCookie = c.get("xake_account")?.value;
    if (fromCookie) return fromCookie;
  } catch {}
  return "acct_demo";
}
