# Changelog

All notable changes to this project will be documented in this file.

## [1.0.5] - 2026-01-05

### Added
- **`ocm mcp add`**: Interactive command to add MCP server configurations.
  - Supports both **Local** (executable) and **Remote** (HTTP/SSE) server types.
  - Local config: command array, environment variables, timeout.
  - Remote config: URL, headers, OAuth (automatic/disabled/custom).
  - Validates server name and checks for existing configurations.
  - Saves directly to `opencode.json` following OpenCode MCP specification.

## [1.0.4] - 2026-01-05

### Added
- Input validation for asset names to prevent path traversal attacks and invalid characters.
- GitHub API rate limit detection with helpful error messages and reset time info.
- Support for `GITHUB_TOKEN` environment variable for higher API rate limits (5000 req/hour).
- Parallel file downloads with concurrency limit (5 max) for faster asset installation.
- Automatic cleanup of partial downloads when installation fails.
- New `src/utils/validation.ts` module with pure validation functions.
- Test script now runs build before tests (`bun run test`).

### Changed
- Optimized `detectIsProd()` to cache result at module load instead of recalculating on every call.
- Pinned `@types/bun` to specific version (`^1.3.5`) for reproducible builds.

### Fixed
- Removed duplicate `detectIsProd()` call in `getPathsForScope()` function.

## [1.0.2] - 2026-01-05

### Added
- Nested agent structure support (e.g., `agent/core/*.md`).
- Validation tests for agent assets.

### Changed
- Renamed `agents` service to `agent` (singular) for consistency.

## [1.0.1] - 2026-01-05

### Added
- Official MIT License.

### Fixed
- Improved consistency between NPM package and GitHub repository.

## [1.0.0] - 2026-01-05

### Added
- **Core Orchestrator**: Initial release of `ocm` CLI.
- **Service Support**: Full management for `skill`, `agent`, `command`, and `mcp`.
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
