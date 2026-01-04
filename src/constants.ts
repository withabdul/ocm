import path from "node:path";
import os from "node:os";

/**
 * OpenCode Manager Constants
 * Handles path resolution for different environments.
 */

// Automatic Production Detection:
// We consider it "Local Dev" ONLY if:
// 1. We are inside a directory named "ocm" AND
// 2. There is a "src" folder and "package.json" in the current working directory
// Otherwise, it's production (user is running the tool).
import fs from "node:fs";

function detectIsProd() {
  // If explicitly set via ENV, respect it
  if (process.env.OCM_ENV === "production") return true;
  if (process.env.OCM_ENV === "development") return false;

  const cwd = process.cwd().toLowerCase();
  
  // Debug
  // console.log(`CWD: ${cwd}`);

  const isOcmFolder = path.basename(cwd) === "ocm";
  const hasSrc = fs.existsSync(path.join(cwd, "src"));
  const hasPackageJson = fs.existsSync(path.join(cwd, "package.json"));

  // If it looks like the dev repo, it's NOT production
  const isDev = isOcmFolder && hasSrc && hasPackageJson;
  return !isDev;
}

const isProd = detectIsProd();


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
