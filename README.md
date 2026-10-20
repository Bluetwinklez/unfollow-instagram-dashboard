# Instagram Following Manager

A Chrome Manifest V3 extension for reviewing Instagram following lists, protecting selected accounts and organizing saved scans in a local workspace. English is the default for new workspace profiles; Turkish remains available. Version **2.10.0**.

## Install

Use the [Chrome Web Store listing](https://chromewebstore.google.com/detail/instagram-takip-y%C3%B6netimi/fiakfpibolpneohdkfejlggbklegiced), or download an extension ZIP from [Releases](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/releases).

For manual installation, extract the ZIP, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the folder containing `manifest.json`. From a source checkout, build first and select `extension/`. Open Instagram while signed in and launch the extension from the toolbar or `Ctrl+Shift+Y`. The workspace button opens the saved-data dashboard.

Before updating, finish/cancel active work and export a backup. Replace the files, reload the extension and refresh Instagram. Uninstalling can remove local data. Repository updates do not automatically replace an installed ZIP or complete Chrome Web Store review.

## Review and operation model

- Scan following accounts, or compare following and followers to identify non-followers. Incomplete comparisons cannot authorize actions.
- Search, select and protect accounts. Review the final eligible target list before confirming any unfollow operation.
- Each target receives a fresh relationship precheck. Already-unfollowed accounts do not receive a new mutation or count as a new success.
- A persistent operation intent must be stored before one mutation request is sent. Success requires independent confirmation that `following` is false.
- Ambiguous responses, verification failures, session changes and rate limits stop the queue. Uncertain records are not automatically retried without a fresh scan.
- Pause, resume and cancel are available. Cancellation cannot undo a request that already reached Instagram.

The default interval is 4–4.8 seconds, with a five-minute break after every five operations. Timing does not guarantee freedom from account restrictions. Instagram's private endpoints can change. Synthetic test success does not establish live-account success; HTTP 200 or HTML is not proof of an unfollow.

## Local workspace

Saved scans support search/filtering, charts, account notes/tags, protection, review queues, sessions, tasks, workflow graphs, simulations and exports. Workspace workflows operate on local saved data and do not initiate background Instagram mutations. Account data is separated by numeric viewer ID.

Exports include JSON, CSV and text. Imports validate schemas and account identity and require preview/confirmation. CSV formula injection is escaped. Undo applies to local edits only. Concurrent saves use revision checks. Corrupt storage is preserved for recovery instead of being silently reset.

## Privacy

The store build requests `activeTab`, `scripting` and `storage`, with no persistent host access or remotely loaded code. Instagram operations use the signed-in session in the active tab. Saved data remains in the Chrome profile; exported files can contain personal information.

The default scan retention is five per account, configurable from one to twenty. Live browser logs are bounded and session-scoped; persistent operation history is separate. Reports exclude cookies, CSRF tokens and raw response bodies. Optional private-development logging helpers are excluded from the store package and do not install themselves as background services.

[Privacy policy](docs/privacy.html) · [Protocol evidence and limits](docs/repair/POLARIS-UNFOLLOW-EVIDENCE.md) · [Release checklist](RELEASE-CHECKLIST.md)

## Development

Use Node 24 and Python 3.12, matching CI:

```bash
npm ci
npx playwright install --with-deps chromium
npm run build
npm run test:unit
npm test
```

`npm run test:unit` runs only the explicit non-browser test manifest. `npm test` runs the full regression suite, Chromium extension integration and release audit. Browser tests use synthetic Instagram responses. Build output is generated from `instagram-tum-takipleri-birak.js` and `instagram-chrome-eklentisi/`; `extension/` is the installable store-safe copy.

Build synchronization stays inside this repository by default. An existing parent workspace is synchronized only with the explicit `IU_SYNC_PARENT=1` development opt-in. Never commit OAuth credentials or private logging configuration. Redistribution rights for third-party source and store approval must be verified separately.

[Detailed previous usage and architecture guide (Turkish)](README.tr.md).
