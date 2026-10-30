import { redirect } from "next/navigation";
import { marked } from "marked";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formResponse, getUser } from "@/lib/clients";
import { DOCS, renderDoc } from "@/lib/docs";
import { FORMS } from "@/lib/forms";
import { AGREE_ITEMS, ONBOARDING_SCREENS } from "@/lib/onboarding";
import OnboardingWizard from "@/components/OnboardingWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/");

  const s = await getSettings();
  const user = await getUser(session.userId);

  // Done with both profile and payout: the portal is home from here on.
  const profileSaved = await formResponse(session.userId, "creator_profile");
  const payoutSaved = await formResponse(session.userId, "payout_details");
  if (user?.seen_intro && profileSaved.status === "submitted" && payoutSaved.status === "submitted") {
    redirect("/");
  }

  const vars = { portal: s.portal_name, email: s.support_email };
  const screens = await Promise.all(
    ONBOARDING_SCREENS.map(async (sc) => {
      const doc = DOCS[sc.doc];
      return {
        id: sc.id,
        kicker: sc.kicker,
        title: doc.title,
        minutes: doc.minutes,
        html: await marked.parse(renderDoc(doc.body, vars)),
      };
    })
  );

  return (
    <OnboardingWizard
      firstName={(session.name || "").split(" ")[0]}
      portalName={s.portal_name}
      screens={screens}
      agreeItems={[...AGREE_ITEMS]}
      profile={{
        form: FORMS.creator_profile,
        data: profileSaved.data as Record<string, string | string[]>,
        status: profileSaved.status,
      }}
      payout={{
        form: FORMS.payout_details,
        data: payoutSaved.data as Record<string, string | string[]>,
        status: payoutSaved.status,
      }}
    />
  );
}
