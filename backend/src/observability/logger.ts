type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta || {}),
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    writeLog("debug", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>) {
    writeLog("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>) {
    writeLog("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>) {
    writeLog("error", message, meta);
  },
};
