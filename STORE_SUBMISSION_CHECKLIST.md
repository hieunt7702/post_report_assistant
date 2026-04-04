# Chrome Web Store Submission Checklist

## Listing Positioning

- Keep the listing single-purpose and explicit.
- State clearly that the extension runs only after the user clicks Start on the current `facebook.com` tab.
- Do not claim features that are not present in the build.

## Permissions Rationale

- `activeTab`: used to access the exact tab the user chooses when opening the popup.
- `scripting`: used to inject the content script only into the active tab at user request.
- `storage`: used only for local session state and count persistence.

## Privacy

- Publish a public privacy-policy URL based on `PRIVACY_POLICY.md`.
- In the Chrome Web Store privacy section, disclose that page interface text is processed locally on the active workflow tab and that no local session data is sent to a server.

## Assets

- Provide screenshots that match the actual popup.
- Use the included `icon16.png`, `icon32.png`, `icon48.png`, and `icon128.png`.

## Risk To Be Aware Of

- This repo is now cleaner from a permissions and transparency standpoint, but Chrome Web Store approval is still not guaranteed.
- Extensions that automate repeated actions on third-party social platforms can still receive manual policy review or rejection depending on how Google interprets current abuse and user-action policies.
