import path from "node:path";
import os from "node:os";

/**
 * OpenCode Manager Constants
 * Handles path resolution for different environments.
 */

const isProd = process.env.OCM_ENV === "production";

// Get paths based on scope
export function getPathsForScope(scope: "global" | "local") {
  const isGlobal = scope === "global";
  
  let base: string;
  if (!isProd) {
    base = path.join(process.cwd(), "tests", ".opencode");
  } else if (isGlobal) {
    base = path.join(os.homedir(), ".config", "opencode");
  } else {
    base = path.join(process.cwd(), ".opencode");
  }

  return {
    base,
    config: path.join(base, "opencode.json"),
    skill: path.join(base, "skill"),
    agents: path.join(base, "agents"),
    command: path.join(base, "command"),
    mcp: path.join(base, "mcp"),
  };
}

// Default export PATHS using current env for backward compatibility
const currentScope = process.env.OCM_GLOBAL === "true" ? "global" : "local";
export const PATHS = getPathsForScope(currentScope);
export const BASE_DIR = PATHS.base;

export const CONFIG_SCHEMA = "https://opencode.ai/config.json";

export const GITHUB_REPO = "withabdul/ocm"; // Default repository source
export const GITHUB_API_BASE = "https://api.github.com/repos";

export type ServiceType = "skill" | "agents" | "command" | "mcp";
