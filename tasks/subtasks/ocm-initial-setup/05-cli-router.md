# 05. Core CLI Routing Implementation

meta:
  id: ocm-initial-setup-05
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-01]
  tags: [implementation, cli]

objective:
- Implement the main entry point and command routing for the CLI.

deliverables:
- `src/index.ts`

steps:
- Parse `process.argv`.
- Route commands: `ocm <service> <action> [args...]`.
- Add help/usage information.

tests:
- Unit: Test the router logic with various mock arguments.
- Integration: Run `bun src/index.ts --help`.

acceptance_criteria:
- Typing `ocm skill install` routes to the correct service logic.
- Unknown commands display help.

validation:
- `bun src/index.ts skill install test-skill`

notes:
- Use a simple switch/case or a lightweight library if needed (though native parsing is preferred for binary size).
