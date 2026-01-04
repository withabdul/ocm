import { PATHS, CONFIG_SCHEMA } from "../constants";
import fs from "node:fs/promises";

export interface OpenCodeConfig {
  $schema?: string;
  mcp?: Record<string, any>;
  [key: string]: any;
}

/**
 * Reads the opencode.json config file.
 * Returns a default config if the file doesn't exist.
 */
export async function readConfig(configPath: string = PATHS.config): Promise<OpenCodeConfig> {
  try {
    const content = await fs.readFile(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return {
      $schema: CONFIG_SCHEMA,
      mcp: {}
    };
  }
}

/**
 * Writes the config to opencode.json, ensuring $schema is the first key.
 */
export async function writeConfig(config: OpenCodeConfig, configPath: string = PATHS.config): Promise<void> {
  // Ensure $schema is at the top by spreading it first
  const { $schema, ...rest } = config;
  
  const orderedConfig = {
    $schema: $schema || CONFIG_SCHEMA,
    ...rest
  };

  await fs.writeFile(
    configPath,
    JSON.stringify(orderedConfig, null, 2),
    "utf-8"
  );
}

/**
 * Updates a specific MCP server entry in the config.
 */
export async function updateMcpConfig(name: string, mcpData: any | null, configPath: string = PATHS.config): Promise<void> {
  const config = await readConfig(configPath);
  
  if (!config.mcp) config.mcp = {};
  
  if (mcpData === null) {
    delete config.mcp[name];
  } else {
    config.mcp[name] = mcpData;
  }
  
  await writeConfig(config, configPath);
}
