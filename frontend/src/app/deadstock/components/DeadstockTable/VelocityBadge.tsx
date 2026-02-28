interface Props {
  velocity: "FAST" | "SLOW" | "FROZEN" | "SEASONAL";
}

export default function VelocityBadge({ velocity }: Props) {
  const styles: Record<string, string> = {
    FAST: "bg-green-100 text-green-700",
    SLOW: "bg-yellow-100 text-yellow-700",
    FROZEN: "bg-red-100 text-red-700",
    SEASONAL: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[velocity]}`}
    >
      {velocity}
    </span>
  );
}