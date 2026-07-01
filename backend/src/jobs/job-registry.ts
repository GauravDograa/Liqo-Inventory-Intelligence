import { BackgroundJobDefinition } from "./job.types";

export const backgroundJobRegistry: BackgroundJobDefinition[] = [
  {
    name: "sync-operational-analytics",
    description: "Refresh daily sales, inventory health, payment, GST, and velocity summaries.",
    enabledByDefault: false,
  },
  {
    name: "generate-recommendations",
    description: "Prepare inventory movement recommendations from current stock and velocity.",
    enabledByDefault: false,
  },
  {
    name: "generate-forecasts",
    description: "Generate rule-based demand, stockout, reorder, seasonal, and festival forecasts.",
    enabledByDefault: false,
  },
  {
    name: "generate-replenishment-suggestions",
    description: "Build warehouse replenishment suggestions from low-stock alerts and forecasts.",
    enabledByDefault: false,
  },
];
