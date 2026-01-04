import { GenericService } from "./generic";
import { readConfig, updateMcpConfig } from "../utils/config";
import chalk from "chalk";

export class McpService extends GenericService {
  constructor() {
    super("mcp");
  }

  override async list() {
    try {
      const config = await readConfig();
      const mcpServers = config.mcp || {};
      const names = Object.keys(mcpServers);

      if (names.length === 0) {
        console.log(chalk.yellow(`No mcp servers found in config.`));
        return;
      }

      console.log(chalk.cyan.bold(`Installed mcp servers (from config):`));
      names.forEach(name => {
        const server = mcpServers[name];
        const status = server.enabled ? chalk.green("enabled") : chalk.red("disabled");
        const type = chalk.gray(`[${server.type}]`);
        console.log(`${chalk.gray(" - ")}${chalk.white(name)} ${type} (${status})`);
      });
    } catch (error: any) {
      console.error(chalk.red(`Error reading mcp config: ${error.message}`));
    }
  }

  async toggle(name: string, enabled: boolean) {
    try {
      const config = await readConfig();
      if (!config.mcp || !config.mcp[name]) {
        throw new Error(`MCP server '${name}' not found in config.`);
      }

      const mcpData = config.mcp[name];
      mcpData.enabled = enabled;

      await updateMcpConfig(name, mcpData);
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
        await updateMcpConfig(name, null);
        console.log(chalk.green(`✅ Removed MCP config for: `) + chalk.bold(name));
      } catch (error: any) {
        console.error(chalk.red(`❌ Failed to remove MCP config for ${name}: ${error.message}`));
      }
    }
  }
}
