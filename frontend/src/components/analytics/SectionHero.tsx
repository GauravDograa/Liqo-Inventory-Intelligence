"use client";

interface SectionHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  accent?: "orange" | "amber" | "slate";
}

const accentClasses = {
  orange:
    "from-orange-500 via-orange-500 to-amber-400 text-white shadow-[0_24px_70px_-32px_rgba(249,115,22,0.65)]",
  amber:
    "from-amber-500 via-orange-500 to-orange-400 text-white shadow-[0_24px_70px_-32px_rgba(245,158,11,0.65)]",
  slate:
    "from-slate-900 via-slate-800 to-slate-700 text-white shadow-[0_24px_70px_-32px_rgba(15,23,42,0.65)]",
};

export default function SectionHero({
  eyebrow,
  title,
  description,
  accent = "orange",
}: SectionHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-7 sm:px-8 sm:py-9 ${accentClasses[accent]}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_34%)]" />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-2rem] left-[-1rem] h-40 w-40 rounded-full bg-black/10 blur-3xl" />

      <div className="relative">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
            {eyebrow}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
