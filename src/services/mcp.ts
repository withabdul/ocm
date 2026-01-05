import { GenericService } from "./generic";
import { readConfig, readConfigRaw, updateMcpConfig } from "../utils/config";
import chalk from "chalk";
import { PATHS } from "../constants";
import * as p from "@clack/prompts";

// MCP Configuration Types (based on OpenCode docs)
export interface McpLocalConfig {
  type: "local";
  command: string[];
  environment?: Record<string, string>;
  enabled?: boolean;
  timeout?: number;
}

export interface McpRemoteConfig {
  type: "remote";
  url: string;
  headers?: Record<string, string>;
  oauth?: Record<string, string> | false;
  enabled?: boolean;
  timeout?: number;
}

export type McpConfig = McpLocalConfig | McpRemoteConfig;

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

  /**
   * Interactive flow to add a new MCP server configuration
   */
  async add(): Promise<void> {
    p.intro(chalk.cyan.bold("Add MCP Server"));

    // Step 1: Get server name
    const name = await p.text({
      message: "MCP server name:",
      placeholder: "e.g., context7, firecrawl, my-mcp",
      validate: (value) => {
        if (!value.trim()) return "Name is required";
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return "Name can only contain letters, numbers, dashes, and underscores";
        return undefined;
      },
    });

    if (p.isCancel(name)) {
      p.cancel("Operation cancelled.");
      return;
    }

    // Check if server already exists
    const existingConfig = await readConfig(this.currentPaths.config);
    if (existingConfig.mcp?.[name]) {
      const overwrite = await p.confirm({
        message: `MCP server '${name}' already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Operation cancelled.");
        return;
      }
    }

    // Step 2: Select server type
    const serverType = await p.select({
      message: "Server type:",
      options: [
        { value: "local", label: "Local", hint: "Executable command (npx, bun, node, etc.)" },
        { value: "remote", label: "Remote", hint: "HTTP/SSE endpoint URL" },
      ],
    });

    if (p.isCancel(serverType)) {
      p.cancel("Operation cancelled.");
      return;
    }

    let mcpConfig: McpConfig;

    if (serverType === "local") {
      mcpConfig = await this.promptLocalConfig();
    } else {
      mcpConfig = await this.promptRemoteConfig();
    }

    // Step 3: Enable on startup?
    const enabled = await p.confirm({
      message: "Enable this MCP server?",
      initialValue: true,
    });

    if (p.isCancel(enabled)) {
      p.cancel("Operation cancelled.");
      return;
    }

    mcpConfig.enabled = enabled;

    // Step 4: Custom timeout?
    const customTimeout = await p.confirm({
      message: "Set custom timeout? (default: 5000ms)",
      initialValue: false,
    });

    if (p.isCancel(customTimeout)) {
      p.cancel("Operation cancelled.");
      return;
    }

    if (customTimeout) {
      const timeout = await p.text({
        message: "Timeout (ms):",
        placeholder: "5000",
        validate: (value) => {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 1000) return "Must be a number >= 1000";
          return undefined;
        },
      });

      if (p.isCancel(timeout)) {
        p.cancel("Operation cancelled.");
        return;
      }

      mcpConfig.timeout = parseInt(timeout, 10);
    }

    // Save to config
    try {
      await updateMcpConfig(name, mcpConfig, this.currentPaths.config);
      
      p.outro(chalk.green(`✅ MCP server '${chalk.bold(name)}' added successfully!`));
      
      // Show summary
      console.log(chalk.gray("\nConfiguration:"));
      console.log(chalk.gray(JSON.stringify(mcpConfig, null, 2)));
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to add MCP server: ${error.message}`));
    }
  }

  /**
   * Prompt for local MCP server configuration
   */
  private async promptLocalConfig(): Promise<McpLocalConfig> {
    const commandInput = await p.text({
      message: "Command (space-separated):",
      placeholder: "npx -y @modelcontextprotocol/server-everything",
      validate: (value) => {
        if (!value.trim()) return "Command is required";
        return undefined;
      },
    });

    if (p.isCancel(commandInput)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const command = commandInput.split(/\s+/).filter(Boolean);

    // Environment variables
    const hasEnv = await p.confirm({
      message: "Add environment variables?",
      initialValue: false,
    });

    if (p.isCancel(hasEnv)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    let environment: Record<string, string> | undefined;

    if (hasEnv) {
      environment = await this.promptKeyValuePairs(
        "Environment variable (KEY=value, empty to finish):",
        "API_KEY=your_key_here"
      );
    }

    const config: McpLocalConfig = {
      type: "local",
      command,
    };

    if (environment && Object.keys(environment).length > 0) {
      config.environment = environment;
    }

    return config;
  }

  /**
   * Prompt for remote MCP server configuration
   */
  private async promptRemoteConfig(): Promise<McpRemoteConfig> {
    const url = await p.text({
      message: "Server URL:",
      placeholder: "https://mcp.example.com/mcp",
      validate: (value) => {
        if (!value.trim()) return "URL is required";
        try {
          new URL(value);
          return undefined;
        } catch {
          return "Must be a valid URL";
        }
      },
    });

    if (p.isCancel(url)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    // Headers
    const hasHeaders = await p.confirm({
      message: "Add custom headers? (e.g., Authorization)",
      initialValue: false,
    });

    if (p.isCancel(hasHeaders)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    let headers: Record<string, string> | undefined;

    if (hasHeaders) {
      headers = await this.promptKeyValuePairs(
        "Header (KEY=value, empty to finish):",
        "Authorization=Bearer {env:API_KEY}"
      );
    }

    // OAuth
    const useOAuth = await p.select({
      message: "OAuth configuration:",
      options: [
        { value: "auto", label: "Automatic", hint: "Let OpenCode handle OAuth automatically" },
        { value: "disabled", label: "Disabled", hint: "Use API keys/headers instead" },
        { value: "custom", label: "Custom", hint: "Provide client credentials" },
      ],
    });

    if (p.isCancel(useOAuth)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const config: McpRemoteConfig = {
      type: "remote",
      url,
    };

    if (headers && Object.keys(headers).length > 0) {
      config.headers = headers;
    }

    if (useOAuth === "disabled") {
      config.oauth = false;
    } else if (useOAuth === "custom") {
      config.oauth = await this.promptOAuthConfig();
    }
    // "auto" = don't set oauth key, let OpenCode handle it

    return config;
  }

  /**
   * Prompt for OAuth configuration
   */
  private async promptOAuthConfig(): Promise<Record<string, string>> {
    const clientId = await p.text({
      message: "Client ID:",
      placeholder: "{env:MY_MCP_CLIENT_ID}",
    });

    if (p.isCancel(clientId)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const clientSecret = await p.text({
      message: "Client Secret (optional):",
      placeholder: "{env:MY_MCP_CLIENT_SECRET}",
    });

    if (p.isCancel(clientSecret)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const scope = await p.text({
      message: "Scope (optional):",
      placeholder: "tools:read tools:execute",
    });

    if (p.isCancel(scope)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    const oauth: Record<string, string> = {};
    if (clientId) oauth.clientId = clientId;
    if (clientSecret) oauth.clientSecret = clientSecret;
    if (scope) oauth.scope = scope;

    return oauth;
  }

  /**
   * Helper to prompt for key-value pairs (environment vars, headers)
   */
  private async promptKeyValuePairs(
    message: string,
    placeholder: string
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    while (true) {
      const input = await p.text({
        message,
        placeholder,
      });

      if (p.isCancel(input)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      if (!input.trim()) break;

      const match = input.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        result[key.trim()] = value.trim();
        console.log(chalk.gray(`  Added: ${key.trim()}`));
      } else {
        console.log(chalk.yellow(`  Invalid format. Use KEY=value`));
      }
    }

    return result;
  }
}
