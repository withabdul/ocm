import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { getPathsForScope } from "../src/constants";
import { readConfig, writeConfig, updateMcpConfig } from "../src/utils/config";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("OCM Core Logic", () => {
  const testBase = path.join(process.cwd(), "tests", ".opencode");

  beforeEach(async () => {
    // Setup clean test environment
    await fs.mkdir(testBase, { recursive: true });
    const configPath = path.join(testBase, "opencode.json");
    await fs.writeFile(configPath, JSON.stringify({ mcp: {} }));
  });

  afterEach(async () => {
    // Cleanup is handled by the next beforeEach or manual delete
  });

  test("Path resolution for scopes", () => {
    const local = getPathsForScope("local");
    const global = getPathsForScope("global");

    // In non-prod (test) mode, both should point to tests/.opencode for safety
    // unless we mock the isProd logic. 
    // Since our constants.ts uses process.cwd() check, in tests it stays as test paths.
    expect(local.base).toContain(path.join("tests", ".opencode"));
    expect(global.base).toContain(path.join("tests", ".opencode"));
  });

  test("Config read/write", async () => {
    const configPath = path.join(testBase, "opencode.json");
    const mockConfig = { mcp: { "test-server": { enabled: true, type: "stdio" } } };
    
    await writeConfig(mockConfig, configPath);
    const read = await readConfig(configPath);
    
    expect(read.mcp).toBeDefined();
    expect(read.mcp!["test-server"].enabled).toBe(true);
    expect(read.$schema).toBeDefined(); // Should auto-add schema
  });

  test("MCP config update", async () => {
    const configPath = path.join(testBase, "opencode.json");
    
    await updateMcpConfig("new-server", { enabled: false, type: "stdio" }, configPath);
    let config = await readConfig(configPath);
    expect(config.mcp!["new-server"].enabled).toBe(false);

    // Test removal
    await updateMcpConfig("new-server", null, configPath);
    config = await readConfig(configPath);
    expect(config.mcp!["new-server"]).toBeUndefined();
  });
});
