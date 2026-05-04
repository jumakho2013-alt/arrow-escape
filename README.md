# Stray Arrows

Sliding-arrow puzzle game for iOS and Android. Vanilla JS + HTML5 Canvas wrapped in
Capacitor 8. Single-file `index.html` (~3958 lines), 461 hand-tuned levels +
500 baked levels + procedural fallback after that.

## Quick start

```sh
npm install              # Capacitor + AdMob plugin
npm run build            # copy index.html, levels, sw.js, sounds → www/
npm run sync             # build + npx cap sync (updates iOS/Android)
npm run open:ios         # opens Xcode for iOS build
npm run open:android     # opens Android Studio
```

To run locally in a browser:
```sh
python3 -m http.server 8081
# open http://localhost:8081/index.html
```

URL flags: `?level=N` jumps to level N. `?fresh=1` bypasses baked
levels and re-generates procedurally (QA only).

## Project layout

| Path | What |
|------|------|
| `index.html` | the whole game — UI, audio, ads, level loader, render loop |
| `handcrafted-levels.js` | 461 levels (1-5 tutorial + arrowsgo imports) |
| `levels-baked.js` | 500 procedurally pre-baked levels (fallback) |
| `sw.js` | Service Worker — versioned cache |
| `manifest.json` | PWA manifest |
| `sounds/` | tap, swoosh, complete, gameover MP3s |
| `www/` | **build output** — Capacitor's `webDir` points here |
| `ios/` | Xcode project |
| `android/` | Gradle project |
| `tools/` | level editor, generator (Python), validator |
| `capacitor.config.json` | Capacitor + plugins config |
| `STORE_LISTING.md` | App Store / Play descriptions, screenshots, age rating |
| `privacy-policy.html` | hosted privacy policy |

## Levels

- **1-5**: hand-built tutorial (small grids, teaches mechanics)
- **6-20**: arrowsgo levels 1-15 (denser, real puzzles)
- **21+**: every 5th level (`25, 30, 35, ...`) is arrowsgo `16, 17, 18, ...`;
  the rest fall through to baked levels.

To replace a level: edit `handcrafted-levels.js`, then bump `?v=` in the
`<script src="handcrafted-levels.js?v=N">` tag in `index.html`. Run
`npm run build` to copy to `www/`.

To design new levels: open `tools/level-editor.html` in a browser. Drag-to-draw
arrows. "Save lvl locally" stores to `localStorage`. "Export ALL saved" emits
the JSON ready to paste into `handcrafted-levels.js`.

To validate everything still solvable: `node tools/validate-handcrafted.js`.

## Versioning

When releasing, bump these together:
- `index.html` → `APP_VERSION = 'v1.0.X'` constant near top
- `package.json` → `"version"`
- `android/app/build.gradle` → `versionCode` (+1) and `versionName`
- `sw.js` → `CACHE_NAME = 'stray-arrows-v1.0.X'`
- iOS Xcode → `CFBundleShortVersionString` and `CFBundleVersion` in `Info.plist`

(See `AUDIT-2026-05-05.md` — there's a TODO to put all five behind a single
`version.json` and `npm run bump-version` script.)

## Storage

LocalStorage keys all prefixed `ae_`. Helpers `_safeJSON(k)` and `_safeSet(k,v)`
silently survive parse errors and `QuotaExceededError`. List of keys is in
`index.html` — search for `_safeSet(`.

## AdMob

`@capacitor-community/admob`. Real production ad unit IDs are in `index.html`
around line 1118. Per the audit, these should eventually move into
`capacitor.config.json` so they don't ship in JS source — but they aren't
secrets in the cryptographic sense; they identify your AdMob slot.

The Android `keystore.properties` is gitignored — keep an offsite copy or
you can't sign the next release.

## Ship checklist

1. `npm run sync` finishes clean
2. `node tools/validate-handcrafted.js` shows ✓ for every level
3. Bump version in all five places (above)
4. iOS: archive in Xcode → upload to TestFlight
5. Android: `./gradlew bundleRelease` → upload AAB to Play Console internal track
6. Screenshots and store description live in `STORE_LISTING.md`

## Audits

- `AUDIT-2026-05-05.md` — most recent
- `AUDIT-2026-05-01.md`, `AUDIT-2026-04-28.md` — older snapshots
