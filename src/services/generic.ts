import { ServiceType, PATHS, GITHUB_REPO } from "../constants";
import { downloadFromGitHub } from "../utils/github";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import registryData from "../registry.json";

const registry = registryData as Record<string, Record<string, { repo: string; path: string }>>;

export class GenericService {
  private currentPaths: typeof PATHS;

  constructor(private type: ServiceType) {
    this.currentPaths = PATHS;
  }

  /**
   * Update the paths used by this service (for multi-scope support)
   */
  setPaths(newPaths: typeof PATHS) {
    this.currentPaths = newPaths;
  }

  private getTargetDir(name: string): string {
    return path.join(this.currentPaths[this.type], name);
  }

  async exists(name: string): Promise<boolean> {
    const dir = this.getTargetDir(name);
    try {
      await fs.access(dir);
      return true;
    } catch {
      return false;
    }
  }

  async install(name: string) {

    console.log(chalk.blue(`Installing ${this.type}: `) + chalk.bold(name) + "...");
    
    let repoSource = GITHUB_REPO;
    let remotePath = `assets/${this.type}/${name}`;

    // Check registry for override
    const serviceRegistry = registry[this.type];
    if (serviceRegistry && serviceRegistry[name]) {
      repoSource = serviceRegistry[name].repo;
      remotePath = serviceRegistry[name].path;
      console.log(chalk.gray(`  Using registry source: ${repoSource}:${remotePath}`));
    }

    const [owner, repo] = repoSource.split("/");
    const localDir = this.getTargetDir(name);

    try {
      await downloadFromGitHub(owner, repo, remotePath, localDir);
      console.log(chalk.green(`✅ Successfully installed ${name} to ${localDir}`));
    } catch (error: any) {
      throw new Error(`Failed to install ${name}: ${error.message}`);
    }
  }

  async getInstalledItems(): Promise<string[]> {
    const baseDir = this.currentPaths[this.type];
    try {
      const items = await fs.readdir(baseDir);
      return items.filter(i => i !== ".gitkeep" && !i.startsWith("."));
    } catch (error) {
      return [];
    }
  }

  async list() {
    const baseDir = this.currentPaths[this.type];
    try {
      const items = (await fs.readdir(baseDir)).filter(i => i !== ".gitkeep");

      
      if (items.length === 0) {
        console.log(chalk.yellow(`No ${this.type} installed.`));
        return;
      }

      console.log(chalk.cyan.bold(`Installed ${this.type}:`));
      items.forEach(item => console.log(chalk.gray(" - ") + chalk.white(item)));
    } catch (error) {
      console.log(chalk.yellow(`No ${this.type} directory found.`));
    }
  }

  async remove(names: string[]) {
    for (const name of names) {
      const dir = this.getTargetDir(name);
      try {
        await fs.rm(dir, { recursive: true, force: true });
        console.log(chalk.green(`✅ Removed ${this.type}: `) + chalk.bold(name));
      } catch (error: any) {
        console.error(chalk.red(`❌ Failed to remove ${name}: ${error.message}`));
      }
    }
  }
}
