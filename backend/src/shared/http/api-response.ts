export type ApiResponse<TData = unknown> = {
  success: boolean;
  data?: TData;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const ok = <TData>(data: TData, message?: string): ApiResponse<TData> => ({
  success: true,
  data,
  message,
});

export const fail = (
  code: string,
  message: string,
  details?: unknown
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});
