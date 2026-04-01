export const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
};

export const formatCoverageDays = (value?: number | null) => {
  const days = value ?? 0;

  if (days >= 365) {
    return `${(days / 365).toFixed(1)}y`;
  }

  if (days >= 30) {
    return `${(days / 30).toFixed(1)}mo`;
  }

  return `${days.toFixed(days >= 10 ? 0 : 1)}d`;
};

export const formatCoverageChange = (value?: number | null) => {
  const days = value ?? 0;
  const prefix = days > 0 ? "+" : "";
  return `${prefix}${formatCoverageDays(days)}`;
};
