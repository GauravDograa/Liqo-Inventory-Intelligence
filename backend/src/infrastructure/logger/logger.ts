type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

class Logger {
  constructor(
    private readonly serviceName: string,
    private readonly minimumLevel: string
  ) {}

  debug(message: string, context: LogContext = {}) {
    this.write("debug", message, context);
  }

  info(message: string, context: LogContext = {}) {
    this.write("info", message, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.write("warn", message, context);
  }

  error(message: string, context: LogContext = {}) {
    this.write("error", message, context);
  }

  private write(level: LogLevel, message: string, context: LogContext) {
    const configuredLevel = this.minimumLevel as LogLevel;
    const minimumPriority = levelPriority[configuredLevel] ?? levelPriority.info;

    if (levelPriority[level] < minimumPriority) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...context,
    };

    const serializedEntry = JSON.stringify(entry);

    if (level === "error") {
      console.error(serializedEntry);
      return;
    }

    if (level === "warn") {
      console.warn(serializedEntry);
      return;
    }

    console.log(serializedEntry);
  }
}

export const createLogger = (serviceName: string, level: string) =>
  new Logger(serviceName, level);

export type AppLogger = ReturnType<typeof createLogger>;
