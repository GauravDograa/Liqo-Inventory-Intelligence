interface Props {
  label: string;
  value: string;
}

export default function InventoryKPICard({ label, value }: Props) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#fffaf5_0%,_#ffffff_100%)] p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-34px_rgba(249,115,22,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </h3>
    </div>
  );
}
