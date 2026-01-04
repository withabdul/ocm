#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { type ServiceType } from "./constants";
import { GenericService } from "./services/generic";
import { McpService } from "./services/mcp";

const program = new Command();

program
  .name("ocm")
  .description(chalk.cyan("OpenCode Manager (ocm) - Standalone orchestrator for OpenCode"))
  .version("1.0.0")
  .configureOutput({
    // Custom output for missing arguments or other command errors
    writeErr: (str) => {
      if (str.includes("missing required argument")) {
        const argName = str.match(/'([^']+)'/)?.[1] || "argument";
        process.stdout.write(chalk.red(`Error: Missing required argument `) + chalk.bold(argName) + "\n");
        process.stdout.write(chalk.gray(`Usage: ocm <service> <action> <name>\n`));
      } else {
        process.stdout.write(chalk.red(str));
      }
    }
  });

/**
 * Helper to create service commands
 */
function createServiceCommand(service: ServiceType) {
  const serviceCmd = program.command(service).description(`Manage ${service} assets`);
  const handler = service === "mcp" ? new McpService() : new GenericService(service);

  if (service !== "mcp") {
    serviceCmd
      .command("install <name>")
      .description(`Install a ${service} from GitHub`)
      .action(async (name) => {
        try {
          await handler.install(name);
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      });
  }

  serviceCmd
    .command("list")
    .description(`List all installed ${service}`)
    .action(async () => {
      try {
        await handler.list();
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  serviceCmd
    .command("remove <names...>")
    .description(`Remove ${service} assets (supports cherry-pick)`)
      .action(async (names) => {
        try {
          await handler.remove(names);
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      });

    serviceCmd
      .command("enable <name>")
      .description(`Enable an ${service} asset`)
      .action(async (name) => {
        try {
          if (service === "mcp") {
            await (handler as McpService).toggle(name, true);
          } else {
            console.log(chalk.yellow(`Enable command is only supported for MCP at the moment.`));
          }
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      });

    serviceCmd
      .command("disable <name>")
      .description(`Disable an ${service} asset`)
      .action(async (name) => {
        try {
          if (service === "mcp") {
            await (handler as McpService).toggle(name, false);
          } else {
            console.log(chalk.yellow(`Disable command is only supported for MCP at the moment.`));
          }
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
      });

  return serviceCmd;
}

// Register all services
createServiceCommand("skill");
createServiceCommand("agents");
createServiceCommand("command");
createServiceCommand("mcp");

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
