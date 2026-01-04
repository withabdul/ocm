import { downloadFromGitHub } from "./utils/github";
import { PATHS } from "./constants";
import path from "node:path";
import fs from "node:fs/promises";

async function test() {
  console.log("Testing GitHub Download Utility...");
  
  const targetDir = path.join(PATHS.skill, "test-download");
  
  try {
    // Simulating download: oven-sh/bun/README.md
    await downloadFromGitHub("oven-sh", "bun", "README.md", path.join(targetDir, "README.md"));
    
    const exists = await fs.stat(path.join(targetDir, "README.md")).then(() => true).catch(() => false);
    if (exists) {
      console.log("✅ Successfully downloaded README.md from GitHub to tests/.opencode/skill/test-download/README.md");
    } else {
      console.error("❌ File not found after download.");
    }
  } catch (error) {
    console.error("❌ Download failed:", error);
  }
}

test();
