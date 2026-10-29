import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getUser } from "@/lib/clients";
import { JOURNEY } from "@/lib/journey";
import IntroScreen from "@/components/IntroScreen";

export const dynamic = "force-dynamic";

export default async function IntroPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUser(session.userId);
  if (!user || user.seen_intro) redirect("/");

  const s = await getSettings();
  return (
    <IntroScreen
      portalName={s.portal_name}
      headline={s.welcome_headline}
      body={s.welcome_body}
      firstName={(session.name || "").split(" ")[0]}
      phases={JOURNEY.map((m) => ({ title: m.title, description: m.description, steps: m.steps.length }))}
    />
  );
}
