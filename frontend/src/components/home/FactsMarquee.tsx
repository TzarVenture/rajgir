import { Marquee } from "./Marquee";
import { SiteIcon } from "./art/SiteIcons";

const FACTS = [
  { icon: "medal" as const, text: "AIMS-certified course" },
  { icon: "stopwatch" as const, text: "RFID chip timing with live SMS splits" },
  { icon: "stupa" as const, text: "2,500 years of living history" },
  { icon: "hills" as const, text: "Five sacred hills" },
  { icon: "route" as const, text: "Heritage finish at Vishwa Shanti Stupa" },
  { icon: "heartpulse" as const, text: "Medical aid every 1.5 km" },
];

/** Slim scrolling band under the hero with the event's headline facts (all taken from the existing page copy). */
export function FactsMarquee() {
  return (
    <div className="border-y border-[#F3DFA8] bg-gradient-to-r from-[#FFF9EF] via-white to-[#FFF9EF] py-3" aria-label="Event highlights">
      <Marquee speed={46}>
        {FACTS.map((f) => {
          return (
            <span key={f.text} className="mx-6 inline-flex items-center gap-2.5 whitespace-nowrap text-xs font-extrabold uppercase tracking-[0.14em] text-[#374151]">
              <SiteIcon name={f.icon} className="h-6 w-6 text-[#C78A12]" accent="#E31B23" />
              {f.text}
              <span className="ml-6 h-1.5 w-1.5 rotate-45 bg-[#E31B23]" aria-hidden />
            </span>
          );
        })}
      </Marquee>
    </div>
  );
}
