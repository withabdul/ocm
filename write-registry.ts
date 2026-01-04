import fs from "node:fs/promises";
import path from "node:path";

const registry = {
  "agents": {
    "openagent": {
      "repo": "withabdul/ocm",
      "path": "assets/agents/openagent"
    }
  },
  "command": {
    "commit": {
      "repo": "withabdul/ocm",
      "path": "assets/command/commit"
    }
  },
  "skill": {
    "frontend-design": {
      "repo": "withabdul/ocm",
      "path": "assets/skill/frontend-design"
    }
  }
};

async function main() {
  const filePath = path.join(process.cwd(), "src", "registry.json");
  await fs.writeFile(filePath, JSON.stringify(registry, null, 2));
  console.log("Registry updated with correct assets path");
}

main().catch(console.error);
