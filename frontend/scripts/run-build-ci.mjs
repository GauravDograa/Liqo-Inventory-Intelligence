import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const distDir = process.env.NEXT_DIST_DIR || ".next-build-ci";
const targetDir = path.resolve(process.cwd(), distDir);

fs.rmSync(targetDir, { recursive: true, force: true });

const command = process.platform === "win32" ? "npm run build" : "npm run build";
const result = spawnSync(command, {
  shell: true,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir,
  },
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

if (result.error) {
  console.error(result.error);
}

process.exit(1);
