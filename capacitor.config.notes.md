# capacitor.config.json — bundle ID note

`appId: "com.strayarrows.puzzle"` controls **Android** `applicationId` only.

**iOS** uses `PRODUCT_BUNDLE_IDENTIFIER` from `ios/App/App.xcodeproj/project.pbxproj`,
which is `strayarrows.puzzle` (no `com.` prefix) — this is the bundle ID
registered with Apple, App Store Connect, AdMob iOS app, and the provisioning
profile. **Do NOT change either.**

Per-store IDs:
- Apple App Store: `strayarrows.puzzle` (approved v1.0)
- Google Play Store: `com.strayarrows.puzzle`

The mismatch is intentional and verified working.
