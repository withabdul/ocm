import path from "node:path";

/**
 * OpenCode Manager Constants
 * Handles path resolution for different environments.
 */

// Default to development mode to protect the root .opencode directory
const isProd = process.env.OCM_ENV === "production";

export const BASE_DIR = isProd ? ".opencode" : path.join("tests", ".opencode");

export const PATHS = {
  base: path.join(process.cwd(), BASE_DIR),
  // opencode.json is at root in prod, but inside tests/.opencode in dev
  config: isProd 
    ? path.join(process.cwd(), "opencode.json") 
    : path.join(process.cwd(), BASE_DIR, "opencode.json"),
  skill: path.join(process.cwd(), BASE_DIR, "skill"),
  agents: path.join(process.cwd(), BASE_DIR, "agents"),
  command: path.join(process.cwd(), BASE_DIR, "command"),
  mcp: path.join(process.cwd(), BASE_DIR, "mcp"),
};

export const CONFIG_SCHEMA = "https://opencode.ai/config.json";

export const GITHUB_REPO = "withabdul/ocm"; // Default repository source
export const GITHUB_API_BASE = "https://api.github.com/repos";

export type ServiceType = "skill" | "agents" | "command" | "mcp";
