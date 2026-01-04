# 04. opencode.json Schema-Aware Manager

meta:
  id: ocm-initial-setup-04
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-02]
  tags: [implementation]

objective:
- Create a manager for `opencode.json` that ensures `$schema` is always the first key.

deliverables:
- `src/utils/config.ts`

steps:
- Implement `readConfig()`, `writeConfig(data)`, `updateService(service, name, data)`.
- Ensure `writeConfig` prepends `$schema: "https://opencode.ai/config.json"`.
- Handle file creation if `opencode.json` doesn't exist.

tests:
- Unit: Verify JSON stringification order of keys.
- Integration: Write a config and check the file content order.

acceptance_criteria:
- `opencode.json` always starts with `$schema`.
- Config is updated correctly when services are added/removed.

validation:
- Check `tests/.opencode/opencode.json` after an update.

notes:
- Use `JSON.stringify` with a custom replacer or object construction to maintain order.
