interface Props {
  score: number;
}

export default function RiskScoreCell({ score }: Props) {
  const getColor = () => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="w-32">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-600">{score}%</p>
    </div>
  );
}