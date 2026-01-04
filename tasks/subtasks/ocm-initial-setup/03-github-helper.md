# 03. GitHub API Asset Helper Implementation

meta:
  id: ocm-initial-setup-03
  feature: ocm-initial-setup
  priority: P2
  depends_on: [ocm-initial-setup-02]
  tags: [implementation, api]

objective:
- Implement a utility to download assets from GitHub using the Content API.

deliverables:
- `src/utils/github.ts`

steps:
- Implement `fetchAsset(user, repo, path)` using `fetch`.
- Handle binary and text files.
- Add support for recursively fetching directory contents if needed for services.

tests:
- Unit: Mock GitHub API response and verify file content retrieval.
- Integration: Download a sample file from a public repo to `tests/.opencode/`.

acceptance_criteria:
- Can successfully download a file from `api.github.com/repos/{user}/{repo}/contents/assets/{service}/{name}`.

validation:
- `bun src/utils/github.ts` (with a test runner or manual script).

notes:
- Repository and user should be configurable or passed as arguments.
