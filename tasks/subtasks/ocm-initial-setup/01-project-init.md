# 01. Project Initialization & Structure

meta:
  id: ocm-initial-setup-01
  feature: ocm-initial-setup
  priority: P2
  depends_on: []
  tags: [setup, implementation]

objective:
- Initialize the Bun project and create the required directory structure.

deliverables:
- `package.json` with basic dependencies.
- Directory structure: `src/services/`, `src/utils/`, `tests/.opencode/`.

steps:
- Initialize Bun project: `bun init -y`.
- Create directory structure.
- Add initial `tsconfig.json` if not present.

tests:
- Unit: N/A (structural).
- Integration: Verify directories exist and `bun` can execute a hello-world in `src/index.ts`.

acceptance_criteria:
- `package.json` exists.
- `src/services/`, `src/utils/`, and `tests/.opencode/` directories exist.

validation:
- `ls -R src/`
- `ls tests/.opencode/`

notes:
- Use `tests/.opencode/` for all dev activities.
