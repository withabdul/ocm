# 07. MCP Service Logic & Config Integration

meta:
  id: ocm-initial-setup-07
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-06]
  tags: [implementation]

objective:
- Implement specific logic for MCP service, including the correct config key and type.

deliverables:
- `src/services/mcp.ts`

steps:
- Extend/use generic logic for asset download.
- Ensure `opencode.json` uses the `mcp` key.
- Set type to `local` for downloaded assets.

tests:
- Integration: Install an MCP and verify the `mcp` section in `opencode.json`.

acceptance_criteria:
- MCP assets are placed in `tests/.opencode/mcp/{name}`.
- `opencode.json` contains valid MCP configuration.

validation:
- `bun src/index.ts mcp install ...`

notes:
- Follow the MCP configuration standard as defined in the context.
