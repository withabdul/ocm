import { GITHUB_API_BASE } from "../constants";
import fs from "node:fs/promises";
import path from "node:path";

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

/**
 * Downloads a file or directory from GitHub recursively.
 */
export async function downloadFromGitHub(
  owner: string,
  repo: string,
  remotePath: string,
  localDir: string
) {
  const url = `${GITHUB_API_BASE}/${owner}/${repo}/contents/${remotePath}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "OpenCode-Manager-OCM"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub: ${response.statusText} (${url})`);
  }

  const data = await response.json() as GitHubContent | GitHubContent[];

  if (Array.isArray(data)) {
    // It's a directory
    await fs.mkdir(localDir, { recursive: true });
    
    for (const item of data) {
      if (item.type === "file" && item.download_url) {
        await downloadFile(item.download_url, path.join(localDir, item.name));
      } else if (item.type === "dir") {
        await downloadFromGitHub(owner, repo, item.path, path.join(localDir, item.name));
      }
    }
  } else {
    // It's a single file
    const dir = path.dirname(localDir);
    await fs.mkdir(dir, { recursive: true });
    
    if (data.type === "file" && data.download_url) {
      await downloadFile(data.download_url, localDir);
    }
  }
}

async function downloadFile(url: string, dest: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download file: ${url}`);
  
  const buffer = await response.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(buffer));
}
