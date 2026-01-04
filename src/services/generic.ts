import { ServiceType, PATHS, GITHUB_REPO } from "../constants";
import { downloadFromGitHub } from "../utils/github";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";

export class GenericService {
  constructor(private type: ServiceType) {}

  private getTargetDir(name: string): string {
    return path.join(PATHS[this.type], name);
  }

  async install(name: string) {
    console.log(chalk.blue(`Installing ${this.type}: `) + chalk.bold(name) + "...");
    
    const [owner, repo] = GITHUB_REPO.split("/");
    const remotePath = `assets/${this.type}/${name}`;
    const localDir = this.getTargetDir(name);

    try {
      await downloadFromGitHub(owner, repo, remotePath, localDir);
      console.log(chalk.green(`✅ Successfully installed ${name} to ${localDir}`));
    } catch (error: any) {
      throw new Error(`Failed to install ${name}: ${error.message}`);
    }
  }

  async list() {
    const baseDir = PATHS[this.type];
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
