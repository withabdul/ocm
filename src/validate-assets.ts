import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml"; // Note: we might need to install this or use a simple regex

async function validateSkill(skillDir: string) {
  const skillPath = path.join(skillDir, "SKILL.md");
  
  try {
    const content = await fs.readFile(skillPath, "utf-8");
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    
    if (!frontmatterMatch) {
      throw new Error(`Skill in ${skillDir} missing frontmatter`);
    }

    const frontmatterRaw = frontmatterMatch[1];
    const lines = frontmatterRaw.split('\n');
    const fm: Record<string, string> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      if (key && rest.length > 0) {
        fm[key.trim()] = rest.join(':').trim();
      }
    }

    // 1. Check required fields
    if (!fm.name) throw new Error("Missing 'name' in frontmatter");
    if (!fm.description) throw new Error("Missing 'description' in frontmatter");

    // 2. Validate name format
    const nameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!nameRegex.test(fm.name)) {
      throw new Error(`Invalid name format: ${fm.name}`);
    }

    if (fm.name.length < 1 || fm.name.length > 64) {
      throw new Error("Name must be 1-64 characters");
    }

    // 3. Match directory name
    const dirName = path.basename(skillDir);
    if (fm.name !== dirName) {
      throw new Error(`Skill name '${fm.name}' does not match directory name '${dirName}'`);
    }

    // 4. Description length
    if (fm.description.length < 1 || fm.description.length > 1024) {
      throw new Error("Description must be 1-1024 characters");
    }

    console.log(`✅ Skill ${fm.name} is valid`);
  } catch (error: any) {
    console.error(`❌ Validation failed in ${skillDir}: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const assetsDir = path.join(process.cwd(), "assets", "skill");
  const skills = await fs.readdir(assetsDir);
  
  for (const skill of skills) {
    const skillPath = path.join(assetsDir, skill);
    const stat = await fs.stat(skillPath);
    if (stat.isDirectory()) {
      await validateSkill(skillPath);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
