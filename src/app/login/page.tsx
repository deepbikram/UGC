import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginPanel from "@/components/LoginPanel";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/");

  const s = getSettings();
  return (
    <Suspense>
      <LoginPanel portalName={s.portal_name} tagline={s.portal_tagline} supportEmail={s.support_email} />
    </Suspense>
  );
}
