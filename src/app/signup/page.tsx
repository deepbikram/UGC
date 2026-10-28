import { redirect } from "next/navigation";
import SignupPanel from "@/components/SignupPanel";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/");

  const s = getSettings();
  return <SignupPanel portalName={s.portal_name} supportEmail={s.support_email} />;
}
