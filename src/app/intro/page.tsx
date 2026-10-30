import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Retired: the Duolingo-style wizard at /onboarding replaces this screen.
export default function IntroPage() {
  redirect("/onboarding");
}
