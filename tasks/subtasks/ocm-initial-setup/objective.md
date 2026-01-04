# OpenCode Manager (ocm) Initial Setup

Objective: Initialize OpenCode Manager (ocm) with CLI routing, GitHub asset management, and service logic for skills, agents, commands, and MCP.

Status legend: [ ] todo, [~] in-progress, [x] done

Tasks
- [ ] 01 — Project Initialization & Structure → `01-project-init.md`
- [ ] 02 — Environment & Path Constants Setup → `02-constants-paths.md`
- [ ] 03 — GitHub API Asset Helper Implementation → `03-github-helper.md`
- [ ] 04 — opencode.json Schema-Aware Manager → `04-config-manager.md`
- [ ] 05 — Core CLI Routing Implementation → `05-cli-router.md`
- [ ] 06 — Skill, Agents, & Command Service Logic → `06-generic-service-logic.md`
- [ ] 07 — MCP Service Logic & Config Integration → `07-mcp-service-logic.md`
- [ ] 08 — Build System for Standalone Binary → `08-build-system.md`

Dependencies
- 02 depends on 01
- 03 depends on 02
- 04 depends on 02
- 05 depends on 01
- 06 depends on 03, 04, 05
- 07 depends on 06
- 08 depends on 07

Exit criteria
- The feature is complete when `ocm` can install, remove, and list skills, agents, commands, and MCPs targeting `tests/.opencode/` with a schema-valid `opencode.json` and builds to a standalone binary.
