interface Props {
  label: string;
  value: string;
}

export default function StoreKPICard({ label, value }: Props) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <h3 className="mt-3 text-2xl font-semibold text-gray-900 tracking-tight">
        {value}
      </h3>
    </div>
  );
}