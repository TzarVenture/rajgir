import { Reveal } from "./Reveal";

/** Eyebrow + big Barlow headline + intro + growing underline, shared by every homepage section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  eyebrowColor = "#E31B23",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  eyebrowColor?: string;
}) {
  const center = align === "center";
  return (
    <Reveal className={`mb-12 ${center ? "text-center" : ""}`}>
      <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: eyebrowColor }}>
        {eyebrow}
      </span>
      <h2 className="mt-2 font-barlow text-4xl font-black uppercase leading-[1.02] tracking-tight text-[#111827] sm:text-5xl">{title}</h2>
      <span className={`rj-underline ${center ? "rj-underline-center" : ""}`} aria-hidden />
      {subtitle ? <p className={`mt-4 max-w-2xl text-[15px] leading-relaxed text-[#4B5563] ${center ? "mx-auto" : ""}`}>{subtitle}</p> : null}
    </Reveal>
  );
}
