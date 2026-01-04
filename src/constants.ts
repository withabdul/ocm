import path from "node:path";
import os from "node:os";
import fs from "node:fs";

/**
 * OpenCode Manager Constants
 * Handles path resolution for different environments.
 */

function detectIsProd() {
  // If explicitly set via ENV, respect it
  if (process.env.OCM_ENV === "production") return true;
  if (process.env.OCM_ENV === "development") return false;

  const cwd = process.cwd().toLowerCase();
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
  const isProd = detectIsProd();
  
  let base: string;
  if (isProd) {
    base = isGlobal 
      ? path.join(os.homedir(), ".config", "opencode")
      : path.join(process.cwd(), ".opencode");
  } else {
    // Test environment - keep everything local to the repo
    base = isGlobal
      ? path.join(process.cwd(), "tests", ".opencode-global")
      : path.join(process.cwd(), "tests", ".opencode");
  }

  return {
    base,
    config: path.join(base, "opencode.json"),
    skill: path.join(base, "skill"),
    agent: path.join(base, "agent"),
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

export type ServiceType = "skill" | "agent" | "command" | "mcp";
