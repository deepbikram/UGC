import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import SetPasswordForm from "@/components/SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const s = await getSettings();
  return <SetPasswordForm portalName={s.portal_name} name={session.name} isAdmin={session.role === "admin"} />;
}
