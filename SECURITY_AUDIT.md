# Repository security and maintenance audit

Date: 2026-11-03. Repository: `Bluetwinklez/unfollow-instagram-dashboard`.

## Scope and method

Extension manifests, package/build layout, release audit, unit tests and synthetic browser tests.

Fetched the repository and scanned all locally fetched Git refs/history with Gitleaks 8.30.1 in fully redacted mode. Reviewed tracked sensitive-file patterns and personal-email candidates. Dependency audits describe the installed/resolved graph on this date; they are not a penetration test or a guarantee that no undiscovered vulnerability exists. Uploaded binaries, remote service configuration and files outside accessible Git refs are outside this scan.

## Changes

Added security scanning and documented review limits; no account mutation or live session inspection was performed.

All maintained repositories receive an English security policy/audit entry point, a pinned and checksum-verified secret-scan workflow, credential ignore patterns and immutable action references. Existing publishing jobs retain their declared permissions. Known false positives, if any, are exempted only by exact historic finding fingerprints; no entire directory or credential rule is disabled.

## Credential and personal-data findings

Two matches are SHA-256 file-integrity digests in a historical test-results manifest, not API keys.

No working private credential was confirmed in this review. No credential values are included in this report. If a real credential is discovered later, revoke it at its provider; deleting source cannot revoke a key or remove forks, caches or clones. Existing GitHub encrypted secrets were neither read nor copied. No live-account credential testing was attempted.

## Validation

Build, unit tests and all 26 synthetic browser/release suites passed. npm audit reports zero known vulnerabilities.

GitHub Actions YAML was checked with Actionlint. Local log files are kept outside the repositories; do not confuse historical README test counts with new results.

## Remaining limits

Synthetic Instagram responses do not establish current private-endpoint compatibility or successful real-account operations.

Main READMEs and new maintenance documents are English. Historical Turkish records and existing application translations remain; this maintenance does not claim a full UI translation. Changes are published in reviewable branches/PRs, not as an untested release.

## Suggested GitHub About description

A Chrome extension and local workspace for reviewing Instagram relationships and managing confirmed actions.

The current GitHub integration rejected repository metadata edits with HTTP 403. This prepared description can be applied when repository administration access is available; it has not been represented as an applied settings change.
