# 02. Environment & Path Constants Setup

meta:
  id: ocm-initial-setup-02
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-01]
  tags: [implementation]

objective:
- Define path constants that toggle between development (`tests/.opencode/`) and production (`.opencode/`).

deliverables:
- `src/constants.ts` containing `OPENCODE_DIR`, `CONFIG_FILE`, and other path helpers.

steps:
- Create `src/constants.ts`.
- Implement logic to detect if running in dev mode (e.g., via `process.env.NODE_ENV` or a flag).
- Export paths for `opencode.json`, `skills/`, `agents/`, `commands/`, and `mcp/`.

tests:
- Unit: Verify `OPENCODE_DIR` points to `tests/.opencode/` during development.

acceptance_criteria:
- All file operations in other modules use constants from this file.
- Dev mode correctly targets the test directory.

validation:
- Run a script to print the exported constants and verify paths.

notes:
- **CRITICAL**: Default to `tests/.opencode/` for now to prevent accidental root modification.
