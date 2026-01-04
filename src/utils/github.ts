import { GITHUB_API_BASE } from "../constants";
import fs from "node:fs/promises";
import path from "node:path";

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

interface GitHubErrorResponse {
  message?: string;
  documentation_url?: string;
}

/** Maximum concurrent downloads to avoid overwhelming the network */
const MAX_CONCURRENT_DOWNLOADS = 5;

/**
 * Checks GitHub API response for rate limit and other errors.
 * Provides clear, actionable error messages.
 */
function handleGitHubError(response: Response, url: string): never {
  const remaining = response.headers.get("X-RateLimit-Remaining");
  const resetTime = response.headers.get("X-RateLimit-Reset");

  if (response.status === 403 && remaining === "0") {
    const resetDate = resetTime 
      ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() 
      : "soon";
    throw new Error(
      `GitHub API rate limit exceeded. Resets at ${resetDate}.\n` +
      `Tip: Set GITHUB_TOKEN environment variable for higher limits (5000 req/hour).`
    );
  }

  if (response.status === 404) {
    throw new Error(`Asset not found on GitHub: ${url}`);
  }

  throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
}

/**
 * Downloads a single file from a URL.
 */
async function downloadFile(url: string, dest: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${url}`);
  }
  
  const buffer = await response.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(buffer));
}

/**
 * Processes items in batches with concurrency limit.
 * Improves performance while avoiding overwhelming the network.
 */
async function processInBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = MAX_CONCURRENT_DOWNLOADS
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Downloads a file or directory from GitHub recursively.
 * Features:
 * - Parallel downloads with concurrency limit
 * - Rate limit detection with helpful error messages
 * - Automatic cleanup on failure
 */
export async function downloadFromGitHub(
  owner: string,
  repo: string,
  remotePath: string,
  localDir: string
): Promise<void> {
  const url = `${GITHUB_API_BASE}/${owner}/${repo}/contents/${remotePath}`;
  
  // Build headers with optional auth token
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "OpenCode-Manager-OCM"
  };
  
  // Support GitHub token for higher rate limits
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    handleGitHubError(response, url);
  }

  const data = await response.json() as GitHubContent | GitHubContent[];

  // Track if we created the directory (for cleanup on failure)
  let createdDir = false;

  try {
    if (Array.isArray(data)) {
      // It's a directory - create it first
      await fs.mkdir(localDir, { recursive: true });
      createdDir = true;
      
      // Separate files and directories
      const files = data.filter(item => item.type === "file" && item.download_url);
      const dirs = data.filter(item => item.type === "dir");

      // Download files in parallel with concurrency limit
      await processInBatches(
        files,
        async (item) => {
          await downloadFile(item.download_url!, path.join(localDir, item.name));
        }
      );

      // Process subdirectories (these will parallelize their own files)
      for (const item of dirs) {
        await downloadFromGitHub(owner, repo, item.path, path.join(localDir, item.name));
      }
    } else {
      // It's a single file
      const dir = path.dirname(localDir);
      await fs.mkdir(dir, { recursive: true });
      createdDir = true;
      
      if (data.type === "file" && data.download_url) {
        await downloadFile(data.download_url, localDir);
      }
    }
  } catch (error) {
    // Cleanup on failure - remove partially downloaded content
    if (createdDir) {
      try {
        await fs.rm(localDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors - original error is more important
      }
    }
    throw error;
  }
}
