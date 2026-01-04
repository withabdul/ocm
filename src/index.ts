#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { type ServiceType, getPathsForScope } from "./constants";
import { GenericService } from "./services/generic";
import { McpService } from "./services/mcp";
import * as p from "@clack/prompts";

const program = new Command();

program
  .name("ocm")
  .description(chalk.cyan("OpenCode Manager (ocm) - Standalone orchestrator for OpenCode"))
  .version("1.0.0")
  .option("-g, --global", "Manage global assets in ~/.config/opencode")
  .option("-l, --local", "Manage local assets in .opencode (default)")
  .configureOutput({
    // Custom output for missing arguments or other command errors
    writeErr: (str) => {
      if (str.includes("missing required argument")) {
        const argName = str.match(/'([^']+)'/)?.[1] || "argument";
        process.stdout.write(chalk.red(`Error: Missing required argument `) + chalk.bold(argName) + "\n");
        
        // Find the command that caused the error to show specific help
        const args = process.argv.slice(2);
        if (args.length >= 2) {
          process.stdout.write(chalk.gray(`Usage: ocm ${args[0]} ${args[1]} <name>\n`));
        } else {
          process.stdout.write(chalk.gray(`Usage: ocm <service> <action> <name>\n`));
        }
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

  // Fallback to help if no subcommand is provided for the service
  serviceCmd.action(() => {
    serviceCmd.outputHelp();
  });

  if (service !== "mcp") {
    serviceCmd
      .command("install <name>")
      .description(`Install a ${service} from GitHub`)
      .action(async (name) => {
        try {
          const opts = program.opts();
          let scopes: ("global" | "local")[] = [];

          if (opts.global) scopes.push("global");
          if (opts.local) scopes.push("local");

          // Interactive cherry-pick if no scope specified
          if (scopes.length === 0) {
            while (true) {
              const selected = await p.multiselect({
                message: `Where do you want to install ${chalk.bold(name)}?`,
                options: [
                  { value: "local", label: "Local project (.opencode/)", hint: "Recommended" },
                  { value: "global", label: "Global (~/.config/opencode/)", hint: "Available everywhere" },
                ],
                required: true,
              });

              if (p.isCancel(selected)) {
                p.cancel("Installation cancelled.");
                process.exit(0);
              }
              
              const currentScopes = selected as ("global" | "local")[];

              // Warning if both are selected
              if (currentScopes.includes("global") && currentScopes.includes("local")) {
                console.log(chalk.yellow(`\n⚠️  Warning: Installing to both global and local is usually unnecessary.`));
                console.log(chalk.gray(`Better to choose one to avoid version conflicts.\n`));
                
                const shouldContinue = await p.confirm({
                  message: "Are you sure you want to continue with both?",
                  initialValue: false,
                });

                if (p.isCancel(shouldContinue)) {
                  p.cancel("Installation cancelled.");
                  process.exit(0);
                }

                if (!shouldContinue) {
                  // User said no, loop back to selection without clearing screen
                  console.log(chalk.gray("Let's pick again...\n"));
                  continue;
                }
              }

              scopes = currentScopes;
              break;
            }
          } else if (scopes.includes("global") && scopes.includes("local")) {
            // Even with flags, if both provided, show confirmation
            console.log(chalk.yellow(`\n⚠️  Warning: Both --global and --local flags provided.`));
            const shouldContinue = await p.confirm({
              message: "Are you sure you want to install to both?",
              initialValue: false,
            });
            if (!shouldContinue) {
              p.cancel("Installation cancelled.");
              process.exit(0);
            }
          }

          // Execute for each scope
          for (const scope of scopes) {
            console.log(chalk.gray(`Scope: ${chalk.bold(scope)}`));
            const paths = getPathsForScope(scope);
            if (handler instanceof GenericService) {
              handler.setPaths(paths);
              
              const alreadyExists = await handler.exists(name);
              if (alreadyExists) {
                const overwrite = await p.confirm({
                  message: `${chalk.bold(name)} is already installed in ${scope}. Overwrite?`,
                  initialValue: false,
                });

                if (p.isCancel(overwrite) || !overwrite) {
                  console.log(chalk.yellow(`  Skipping ${scope} installation.`));
                  continue;
                }
                
                // If overwrite, we can either let downloadFromGitHub handle it or remove first
                // Removing first ensures a clean install if files were removed from source
                await handler.remove([name]);
              }
            }
            await handler.install(name);
          }

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
        const opts = program.opts();
        
        // If specific scope is requested via flag
        if (opts.global || opts.local) {
          const scope = opts.global ? "global" : "local";
          const paths = getPathsForScope(scope);
          if (handler instanceof GenericService) handler.setPaths(paths);
          console.log(chalk.gray(`Scope: ${chalk.bold(scope)}`));
          await handler.list();
          return;
        }

        // Default behavior: Check Local, if empty/not found, check Global
        const localPaths = getPathsForScope("local");
        if (handler instanceof GenericService) handler.setPaths(localPaths);
        
        let localHasItems = false;
        if (service === "mcp" && handler instanceof McpService) {
          localHasItems = await handler.hasMcpConfig();
        } else if (handler instanceof GenericService) {
          const items = await handler.getInstalledItems();
          localHasItems = items.length > 0;
        }

        if (localHasItems) {
          console.log(chalk.gray(`Scope: ${chalk.bold("local")}`));
          await handler.list();
        } else {
          // Fallback to Global
          const globalPaths = getPathsForScope("global");
          if (handler instanceof GenericService) handler.setPaths(globalPaths);
          
          let globalHasItems = false;
          if (service === "mcp") {
            globalHasItems = await (handler as McpService).hasMcpConfig();
            if (!globalHasItems) {
               // DEBUG
               // console.log(`No MCP config found at ${globalPaths.config}`);
            }
          } else if (handler instanceof GenericService) {
            const items = await handler.getInstalledItems();
            globalHasItems = items.length > 0;
          }
          
          if (globalHasItems) {
            console.log(chalk.gray(`Scope: ${chalk.bold("global")} (fallback)`));
            await handler.list();
          } else {
            console.log(chalk.yellow(`No ${service} installed in local or global scope.`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });


    serviceCmd
      .command("remove [names...]") // Made names optional for cherry-pick
      .description(`Remove ${service} assets (supports cherry-pick)`)
      .action(async (names) => {
        try {
          const opts = program.opts();
          const scope = opts.global ? "global" : "local";
          const paths = getPathsForScope(scope);
          
          if (handler instanceof GenericService) {
            handler.setPaths(paths);
          }

          let namesToRemove = names;

          // Interactive cherry-pick if no names provided
          if (!namesToRemove || namesToRemove.length === 0) {
            const installed = await handler.getInstalledItems();
            
            if (installed.length === 0) {
              console.log(chalk.yellow(`No ${service} installed in ${scope} scope to remove.`));
              return;
            }

            const selected = await p.multiselect({
              message: `Select ${service} to remove (Space to select, Enter to confirm):`,
              options: installed.map(item => ({ value: item, label: item })),
              required: true,
            });

            if (p.isCancel(selected)) {
              p.cancel("Operation cancelled.");
              process.exit(0);
            }
            namesToRemove = selected as string[];
          }

          await handler.remove(namesToRemove);
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
          const opts = program.opts();
          const scope = opts.global ? "global" : "local";
          const paths = getPathsForScope(scope);

          if (handler instanceof GenericService) {
            handler.setPaths(paths);
          }

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
          const opts = program.opts();
          const scope = opts.global ? "global" : "local";
          const paths = getPathsForScope(scope);

          if (handler instanceof GenericService) {
            handler.setPaths(paths);
          }

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
