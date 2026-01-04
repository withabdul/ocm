import { expect, test, describe } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";

async function getSkills() {
  const assetsDir = path.join(process.cwd(), "assets", "skill");
  try {
    const skills = await fs.readdir(assetsDir);
    const skillDirs = [];
    for (const skill of skills) {
      const skillPath = path.join(assetsDir, skill);
      const stat = await fs.stat(skillPath);
      if (stat.isDirectory()) {
        skillDirs.push({ name: skill, path: skillPath });
      }
    }
    return skillDirs;
  } catch (e) {
    return [];
  }
}

describe("Asset Validation: Skills", async () => {
  const skills = await getSkills();

  if (skills.length === 0) {
    test("No skills found to validate", () => {
      console.log("No skills found in assets/skill");
    });
  }

  for (const skill of skills) {
    describe(`Skill: ${skill.name}`, () => {
      const skillFile = path.join(skill.path, "SKILL.md");

      test("SKILL.md exists", async () => {
        const exists = await fs.stat(skillFile).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      });

      test("valid frontmatter", async () => {
        const content = await fs.readFile(skillFile, "utf-8");
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        expect(frontmatterMatch).not.toBeNull();

        const frontmatterRaw = frontmatterMatch![1];
        const lines = frontmatterRaw.split('\n');
        const fm: Record<string, string> = {};
        for (const line of lines) {
          const [key, ...rest] = line.split(':');
          if (key && rest.length > 0) {
            fm[key.trim()] = rest.join(':').trim();
          }
        }

        // 1. Required fields
        expect(fm.name).toBeDefined();
        expect(fm.description).toBeDefined();

        // 2. Name format
        const nameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        expect(fm.name).toMatch(nameRegex);
        expect(fm.name.length).toBeGreaterThanOrEqual(1);
        expect(fm.name.length).toBeLessThanOrEqual(64);

        // 3. Match directory name
        expect(fm.name).toBe(skill.name);

        // 4. Description length
        expect(fm.description.length).toBeGreaterThanOrEqual(1);
        expect(fm.description.length).toBeLessThanOrEqual(1024);
      });
    });
  }
});
