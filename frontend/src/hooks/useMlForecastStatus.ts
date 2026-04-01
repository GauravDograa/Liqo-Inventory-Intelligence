"use client";

import { useQuery } from "@tanstack/react-query";
import { getMlForecastOpsStatus } from "@/services/mlForecast.service";
import { MlForecastOpsStatus } from "@/types/mlForecast.types";

export const useMlForecastStatus = () => {
  return useQuery<MlForecastOpsStatus>({
    queryKey: ["ml-forecast-status"],
    queryFn: getMlForecastOpsStatus,
    staleTime: 1000 * 60 * 5,
  });
};
