# 🛠️ OpenCode Manager (ocm)

**OpenCode Manager (ocm)** is a powerful, interactive CLI orchestrator for the OpenCode ecosystem. It helps you manage agent skills, autonomous agents, custom commands, and MCP (Model Context Protocol) servers with ease.

Built for speed and flexibility, `ocm` supports both local project-based assets and global configurations.

---

## 🚀 Quick Start

### Installation

Install globally using [Bun](https://bun.sh):

```bash
bun install -g withabdul/ocm
```

### Basic Usage

Manage your assets interactively:

```bash
# Install a new skill
ocm skill install frontend-design

# List all installed agents
ocm agents list

# Toggle an MCP server
ocm mcp enable firecrawl
```

---

## 📦 Key Features

- **Multi-Scope Management**: Choose between Local (`.opencode/`) or Global (`~/.config/opencode/`) installation.
- **Interactive UI**: Smart prompts for installation targets and asset cherry-picking.
- **Auto-Fallback**: `list` commands automatically check Local scope first and fallback to Global if empty.
- **Asset Registry**: Built-in resolution for core assets (skills, agents, commands).
- **MCP Orchestration**: Easily enable, disable, or list Model Context Protocol servers directly from your `opencode.json`.
- **Validation-First**: Built-in asset validation ensures all skills follow the [OpenCode Standards](https://opencode.ai/docs/skills/).

---

## 🛠️ Commands

| Command | Description |
| :--- | :--- |
| `ocm skill <action>` | Manage reusable behavior definitions |
| `ocm agents <action>` | Manage autonomous agent definitions |
| `ocm command <action>` | Manage custom CLI tool instructions |
| `ocm mcp <action>` | Orchestrate Model Context Protocol servers |

### Common Actions
- `install <name>`: Download asset from registry.
- `list`: View installed assets (supports local/global fallback).
- `remove [names...]`: Delete assets (supports interactive cherry-pick).
- `enable/disable <name>`: Toggle status (MCP only).

---

## 🤝 Contributing

Contributions are welcome! If you want to add a new skill or feature:

1. **Fork** the repository.
2. Add your asset to `assets/skill/<name>/SKILL.md`.
3. Run tests: `bun test`.
4. Submit a **Pull Request**.

---

## 🗑️ Uninstall

To remove the CLI tool but keep your assets intact:

```bash
bun remove -g ocm
```

---

## 📄 License

MIT © [withabdul](https://github.com/withabdul)
