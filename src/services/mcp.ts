import { GenericService } from "./generic";
import { readConfig, readConfigRaw, updateMcpConfig } from "../utils/config";
import chalk from "chalk";
import { PATHS } from "../constants";

export class McpService extends GenericService {
  constructor() {
    super("mcp");
  }

  override async list() {
    try {
      const config = await readConfig(this.currentPaths.config);
      const mcpServers = config.mcp || {};
      const names = Object.keys(mcpServers);

      if (names.length === 0) {
        console.log(chalk.yellow(`No mcp servers found in ${this.currentPaths.config}.`));
        return;
      }

      console.log(chalk.cyan.bold(`Installed mcp servers (from config):`));
      names.forEach(name => {
        const server = mcpServers[name];
        // If enabled key is missing, it is considered enabled by default
        const isEnabled = server.enabled !== false;
        const status = isEnabled ? chalk.green("enabled") : chalk.red("disabled");
        const type = chalk.gray(`[${server.type}]`);
        console.log(`${chalk.gray(" - ")}${chalk.white(name)} ${type} (${status})`);
      });
    } catch (error: any) {
      console.error(chalk.red(`Error reading mcp config: ${error.message}`));
    }
  }

  async hasMcpConfig(): Promise<boolean> {
    try {
      const config = await readConfigRaw(this.currentPaths.config);
      if (!config) return false;
      return Object.keys(config.mcp || {}).length > 0;
    } catch {
      return false;
    }
  }

  async toggle(name: string, enabled: boolean) {
    try {
      const config = await readConfig(this.currentPaths.config);
      if (!config.mcp || !config.mcp[name]) {
        throw new Error(`MCP server '${name}' not found in config.`);
      }

      const mcpData = config.mcp[name];
      mcpData.enabled = enabled;

      await updateMcpConfig(name, mcpData, this.currentPaths.config);
      const statusText = enabled ? chalk.green("enabled") : chalk.red("disabled");
      console.log(chalk.blue(`✅ MCP server `) + chalk.bold(name) + ` is now ${statusText}`);
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  }

  override async remove(names: string[]) {
    for (const name of names) {
      try {
        await updateMcpConfig(name, null, this.currentPaths.config);
        console.log(chalk.green(`✅ Removed MCP config for: `) + chalk.bold(name));
      } catch (error: any) {
        console.error(chalk.red(`❌ Failed to remove MCP config for ${name}: ${error.message}`));
      }
    }
  }
}
