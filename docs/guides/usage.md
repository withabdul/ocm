# Usage Guide

Welcome to the **OpenCode Manager (ocm)** guide. This document explains how to get the most out of the CLI.

## Installation

`ocm` is built with Bun. To install it globally:

```bash
bun install -g withabdul/ocm
```

## Scopes: Global vs Local

OpenCode search for assets in multiple locations. `ocm` allows you to manage both:

- **Local (`.opencode/`)**: Specific to your current project/directory. Recommended for project-specific skills.
- **Global (`~/.config/opencode/`)**: Available to all OpenCode agents on your machine.

When installing an asset, `ocm` will ask you which scope to use. Use the `-g` flag to bypass the prompt and target global directly.

## Managing Skills, Agents, and Commands

These assets follow a similar workflow:

### Installing
```bash
ocm skill install <name>
```
If the `<name>` exists in our registry, it will be downloaded. If not, it will fallback to the default asset repository.

### Listing
```bash
ocm skill list
```
The list command is smart: it shows local assets if they exist, otherwise it automatically shows global ones.

### Removing
```bash
ocm skill remove
```
Running remove without arguments triggers an interactive **Cherry-pick** mode where you can select multiple items to delete.

## Model Context Protocol (MCP)

`ocm` can manage your MCP servers defined in `opencode.json`.

- **List Servers**: `ocm mcp list`
- **Enable/Disable**: `ocm mcp enable <name>`
- **Remove Config**: `ocm mcp remove <name>`

## Troubleshooting

If `ocm` reports that it cannot find assets but you know they exist, check your `opencode.json` for syntax errors. `ocm` will warn you if it fails to parse the config file.
