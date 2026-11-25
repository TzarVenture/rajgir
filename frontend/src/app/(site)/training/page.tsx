import type { Metadata } from "next";
import { LuBanana, LuBot, LuDroplets, LuPersonStanding } from "react-icons/lu";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Badge, Breadcrumb, Card, PageHero } from "@/components/ui";
import TrainingTools from "./TrainingTools";

export const metadata: Metadata = {
  title: "Training | Rajgir Marathon",
  description: "Training plans, pace and BMI calculators, hydration, nutrition and stretching guides for the Rajgir Marathon.",
};

const GUIDES = [
  {
    icon: LuDroplets,
    title: "Hydration",
    points: [
      "Drink 400-600 ml of water 2 hours before the start.",
      "During the race, take 150-250 ml every 20 minutes at hydration points.",
      "Add electrolytes for runs over 60 minutes; Rajgir mornings are humid.",
      "Pale-yellow urine is a good sign you are hydrated.",
    ],
  },
  {
    icon: LuBanana,
    title: "Nutrition",
    points: [
      "Carb-load lightly in the last 2 days: rice, pasta, roti, banana.",
      "Eat a familiar breakfast 2-3 hours before the gun.",
      "For half and full marathons, take 30-60 g of carbs per hour (gels, dates, banana).",
      "Recover within 45 minutes: carbs plus protein.",
    ],
  },
  {
    icon: LuPersonStanding,
    title: "Stretching",
    points: [
      "Warm up with 5-10 minutes of easy jogging and leg swings.",
      "After runs: calves, quads, hamstrings, hip flexors, 30 seconds each side.",
      "Foam-roll the calves and IT band on rest days.",
      "Stop and rest if you feel sharp pain, not just muscle tightness.",
    ],
  },
];

export default function TrainingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Training" }]} />
          <PageHero
            eyebrow={<Badge tone="heritage">Rajgir Marathon 2027</Badge>}
            title="Train for Rajgir"
            subtitle="Plans for every distance, a pace calculator with split times, and simple guides for hydration, nutrition and stretching."
          />

          <TrainingTools />

          <h2 className="mb-4 mt-10 font-barlow text-2xl font-bold uppercase text-charcoal-900">Race-ready guides</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {GUIDES.map(({ icon: Icon, title, points }) => (
              <Card key={title}>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-base font-bold">{title}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-charcoal-600">
                  {points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card className="mt-6 flex items-start gap-4 border-dashed">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-charcoal-100 text-charcoal-700">
              <LuBot className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">AI Coach</h3>
                <Badge tone="info">Coming in Phase 2</Badge>
              </div>
              <p className="mt-1 text-sm text-charcoal-600">
                Personalised training plans that adapt to your progress will arrive after launch. Until then, use the general plans above.
              </p>
            </div>
          </Card>

          <p className="mt-6 text-xs text-charcoal-500">
            General guidance only, not medical advice. Check with a doctor before starting a training programme.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
