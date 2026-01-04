import path from "node:path";
import os from "node:os";

/**
 * OpenCode Manager Constants
 * Handles path resolution for different environments.
 */

const isProd = process.env.OCM_ENV === "production";
const isGlobal = process.env.OCM_GLOBAL === "true";

// Helper to get base directory
function getBaseDir() {
  if (!isProd) return path.join(process.cwd(), "tests", ".opencode");
  if (isGlobal) return path.join(os.homedir(), ".config", "opencode");
  return path.join(process.cwd(), ".opencode");
}

export const BASE_DIR = getBaseDir();

export const PATHS = {
  base: BASE_DIR,
  config: path.join(BASE_DIR, "opencode.json"),
  skill: path.join(BASE_DIR, "skill"),
  agents: path.join(BASE_DIR, "agents"),
  command: path.join(BASE_DIR, "command"),
  mcp: path.join(BASE_DIR, "mcp"),
};

export const CONFIG_SCHEMA = "https://opencode.ai/config.json";

export const GITHUB_REPO = "withabdul/ocm"; // Default repository source
export const GITHUB_API_BASE = "https://api.github.com/repos";

export type ServiceType = "skill" | "agents" | "command" | "mcp";
