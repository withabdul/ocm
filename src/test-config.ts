import { readConfig, writeConfig, updateMcpConfig } from "./utils/config";
import { PATHS } from "./constants";
import fs from "node:fs/promises";

async function test() {
  console.log("Testing Config Manager...");

  try {
    // 1. Initial write
    await updateMcpConfig("weather-server", {
      type: "local",
      command: ["bun", "run", "weather.ts"],
      enabled: true
    });

    // 2. Read back raw content to check order
    const rawContent = await fs.readFile(PATHS.config, "utf-8");
    console.log("Current opencode.json content:");
    console.log(rawContent);

    if (rawContent.trim().startsWith('{\n  "$schema":')) {
      console.log("✅ $schema is at the top of the file.");
    } else {
      console.error("❌ $schema is NOT at the top.");
    }

    // 3. Add another one
    await updateMcpConfig("github-server", {
      type: "remote",
      url: "https://mcp.github.com"
    });
    
    console.log("✅ Successfully updated config with multiple entries.");
  } catch (error) {
    console.error("❌ Config test failed:", error);
  }
}

test();
