import { env } from "../../config/env";
import { createLogger } from "./logger";

export const logger = createLogger(env.serviceName, env.logLevel);
