import { expect, test, describe, beforeEach } from "bun:test";
import { GenericService } from "../src/services/generic";
import { getPathsForScope } from "../src/constants";
import fs from "node:fs/promises";
import path from "node:path";

describe("GenericService", () => {
  const testBase = path.join(process.cwd(), "tests", ".opencode");
  const skillDir = path.join(testBase, "skill");

  beforeEach(async () => {
    await fs.mkdir(skillDir, { recursive: true });
    // Clean up skill dir
    const files = await fs.readdir(skillDir);
    for (const file of files) {
      await fs.rm(path.join(skillDir, file), { recursive: true, force: true });
    }
  });

  test("List items in scope", async () => {
    const service = new GenericService("skill");
    service.setPaths(getPathsForScope("local"));

    await fs.mkdir(path.join(skillDir, "my-skill"), { recursive: true });
    
    const items = await service.getInstalledItems();
    expect(items).toContain("my-skill");
  });

  test("Remove items in scope", async () => {
    const service = new GenericService("skill");
    service.setPaths(getPathsForScope("local"));

    const target = path.join(skillDir, "delete-me");
    await fs.mkdir(target, { recursive: true });
    
    await service.remove(["delete-me"]);
    
    const exists = await fs.stat(target).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });
});
