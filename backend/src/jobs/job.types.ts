export type BackgroundJobName =
  | "sync-operational-analytics"
  | "generate-recommendations"
  | "generate-forecasts"
  | "generate-replenishment-suggestions";

export type BackgroundJobDefinition = {
  name: BackgroundJobName;
  description: string;
  enabledByDefault: boolean;
};
