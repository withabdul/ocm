# 06. Skill, Agents, & Command Service Logic

meta:
  id: ocm-initial-setup-06
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-03, ocm-initial-setup-04, ocm-initial-setup-05]
  tags: [implementation]

objective:
- Implement install, remove, and list logic for Skill, Agents, and Command services.

deliverables:
- `src/services/generic.ts` or `src/services/base.ts`.

steps:
- Implement `install(name, repoUrl)`: download assets and update `opencode.json`.
- Implement `remove(names[])`: delete files and update `opencode.json` (support cherry-pick).
- Implement `list()`: read from `opencode.json`.

tests:
- Integration: Install a skill, verify it's in `opencode.json` and files exist.
- Integration: Remove multiple skills at once.

acceptance_criteria:
- `ocm skill remove skill1 skill2` removes both entries.
- Files are deleted from `tests/.opencode/{service}/{name}`.

validation:
- `bun src/index.ts skill install ...`
- `bun src/index.ts skill remove ...`

notes:
- Logic is similar for Skill, Agents, and Command, so generic implementation is preferred.
