interface RecommendationKPICardProps {
  label: string;
  value: string;
}

export default function RecommendationKPICard({
  label,
  value,
}: RecommendationKPICardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-semibold mt-2 text-gray-900">
        {value}
      </h3>
    </div>
  );
}