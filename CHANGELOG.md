# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-05

### Added
- Official MIT License.

### Fixed
- Improved consistency between NPM package and GitHub repository.

## [1.0.0] - 2026-01-05

### Added
- **Core Orchestrator**: Initial release of `ocm` CLI.
- **Service Support**: Full management for `skill`, `agents`, `command`, and `mcp`.
- **Global/Local Scopes**: Ability to install and manage assets in `~/.config/opencode` or `.opencode`.
- **Interactive UI**: Added `@clack/prompts` for cherry-picking installation scopes and asset removal.
- **Asset Registry**: Built-in mapping for popular OpenCode assets.
- **MCP Management**: Integrated command to list, enable, disable, and remove MCP servers from `opencode.json`.
- **Auto-Fallback**: Smart `list` command that bridges local and global configurations.
- **Asset Validation**: GitHub Workflow and `bun:test` suite for validating `SKILL.md` structure.

### Changed
- Refactored `McpService` to use protected inheritance for better path consistency.
- Improved production detection logic to automatically differentiate between developer environment and global usage.

### Fixed
- Fixed `ReferenceError` related to `PATHS` in `McpService`.
- Fixed JSON parsing behavior to provide detailed warnings for corrupted `opencode.json` files (e.g., trailing commas).
- Fixed default MCP state to be `enabled` if the key is missing from configuration.
