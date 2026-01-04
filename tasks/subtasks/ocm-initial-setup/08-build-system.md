# 08. Build System for Standalone Binary

meta:
  id: ocm-initial-setup-08
  feature: ocm-initial-setup
  priority: P3
  depends_on: [ocm-initial-setup-07]
  tags: [build]

objective:
- Setup a build script to compile the project into a standalone `ocm` binary.

deliverables:
- `package.json` build scripts.
- Compiled `ocm` binary.

steps:
- Add `"build": "bun build ./src/index.ts --compile --outfile ocm"` to `package.json`.
- Test the build process.
- Verify the binary runs and defaults to the correct directories.

tests:
- E2E: Run the compiled `./ocm` and perform a list operation.

acceptance_criteria:
- A single `ocm` executable is produced.
- The binary is functional without `bun` installed (in theory, as it's self-contained).

validation:
- `./ocm --help`

notes:
- Ensure paths in the binary still target `tests/.opencode/` unless a prod flag is provided.
