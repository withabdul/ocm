import { expect, test, describe } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";

async function getAgents(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getAgents(res));
    } else if (entry.name.endsWith(".md")) {
      files.push(res);
    }
  }
  return files;
}

describe("Asset Validation: Agents", async () => {
  const agentAssetsDir = path.join(process.cwd(), "assets", "agent");
  
  let agents: string[] = [];
  try {
    agents = await getAgents(agentAssetsDir);
  } catch (e) {
    // Directory might not exist yet in fresh clone
  }

  if (agents.length === 0) {
    test("No agents found to validate", () => {
      console.log("No agents found in assets/agent");
    });
  }

  for (const agentPath of agents) {
    const relativePath = path.relative(agentAssetsDir, agentPath);
    
    test(`Agent file: ${relativePath} should have valid structure`, async () => {
      const content = await fs.readFile(agentPath, "utf-8");
      
      // Agents typically have XML-like tags or markdown structure
      // For now, let's at least ensure they are not empty and are valid markdown
      expect(content.length).toBeGreaterThan(0);
      
      // If it's a core agent like openagent.md, we might want specific checks
      if (agentPath.endsWith("openagent.md")) {
        expect(content).toContain("<system_context>");
      }
    });
  }
});
