import { expect, test, describe, beforeEach } from "bun:test";
import { McpService } from "../src/services/mcp";
import { getPathsForScope } from "../src/constants";
import fs from "node:fs/promises";
import path from "node:path";

describe("McpService", () => {
  const testBase = path.join(process.cwd(), "tests", ".opencode");
  const configPath = path.join(testBase, "opencode.json");

  beforeEach(async () => {
    await fs.mkdir(testBase, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({ mcp: { "existing": { enabled: true, type: "stdio" } } }));
  });

  test("Initializes with default paths", () => {
    const mcp = new McpService();
    expect(mcp).toBeDefined();
  });

  test("Toggles MCP server status", async () => {
    const mcp = new McpService();
    mcp.setPaths(getPathsForScope("local"));

    await mcp.toggle("existing", false);
    
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    expect(config.mcp["existing"].enabled).toBe(false);
  });

  test("Checks for existing MCP config", async () => {
    const mcp = new McpService();
    mcp.setPaths(getPathsForScope("local"));
    
    const hasItems = await mcp.hasMcpConfig();
    expect(hasItems).toBe(true);
  });
});
