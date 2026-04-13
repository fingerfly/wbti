# Security Policy

## Supported Versions

Only the latest `main` branch is supported for security fixes.

## Reporting a Vulnerability

- Do not open public issues for suspected secrets or vulnerabilities.
- Report privately to the repository maintainers through GitHub private
  vulnerability reporting.
- Include: impact, reproduction steps, affected files/paths, and any logs.

## Response Targets

- Acknowledgement: within 72 hours.
- Initial triage: within 7 calendar days.
- Fix timeline: based on severity and exploitability.

## Secret Leak Playbook

If a secret is exposed:

1. Rotate or revoke the secret immediately at the provider side.
2. Remove the secret from files and CI variables.
3. Purge git history if needed (for example `git filter-repo`), then force-push
   only after maintainers approve the incident plan.
4. Re-scan repository history with secret scanning tools.
5. Document incident scope and remediation actions in internal notes.

## Hardening Baseline

- Keep deploy/runtime secrets out of git (`.env*` ignored).
- Keep internal planning and agent metadata local (`.cursor/` ignored).
- Run CI secret scans on `push` and `pull_request`.
- Enable local pre-commit secret scan:
  - `git config core.hooksPath .githooks`
  - `node scripts/precommitSecretScan.js` (or `npm run secrets:scan-staged`)
  - keep `.secret-scan-allowlist.json` minimal and fully justified
- Enable local pre-push guard:
  - `.githooks/pre-push` runs `node scripts/prepushPublicGuard.js`
  - blocks tracked `.cursor/`, blocks non-template `.env*`, and runs `npm test`
