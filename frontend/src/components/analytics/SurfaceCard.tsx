"use client";

import { ReactNode } from "react";

interface SurfaceCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function SurfaceCard({
  title,
  subtitle,
  children,
  action,
  className = "",
  contentClassName = "",
}: SurfaceCardProps) {
  return (
    <section
      className={`rounded-[2rem] border border-slate-200/75 bg-white/90 p-6 shadow-[0_22px_55px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-7 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={contentClassName ? `mt-6 ${contentClassName}` : "mt-6"}>
        {children}
      </div>
    </section>
  );
}
