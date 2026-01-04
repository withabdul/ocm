# Asset Contribution Guide

We love new skills and agents! Follow these steps to add yours to the `ocm` ecosystem.

## Asset Structure

Each asset must be placed in the correct category under the `assets/` directory:

```text
assets/
├── skill/
│   └── <name>/
│       └── SKILL.md
├── agent/
│   └── <name>/
│       └── AGENT.md
└── command/
    └── <name>/
        └── COMMAND.md
```

## Creating a Skill

`SKILL.md` files must follow the [OpenCode Standards](https://opencode.ai/docs/skills/):

1. **Frontmatter**: Must include `name` and `description`.
2. **Naming**: Alphanumeric lowercase with hyphens.
3. **Location**: Directory name must match the `name` in frontmatter.

### Example SKILL.md
```markdown
---
name: my-new-skill
description: A brief explanation of what this skill does
---

## What I do
- Task A
- Task B
```

## Registering Your Asset

Once your files are in place, add an entry to `src/registry.json` so the CLI knows where to find it.

## Verification

Before submitting a Pull Request, please run the validation suite:

```bash
bun test
```

Our CI will automatically run these tests and approve valid assets.
