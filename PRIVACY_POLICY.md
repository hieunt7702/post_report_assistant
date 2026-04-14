# Privacy Policy 

Last updated: 2026-04-15 (Version 2.3.0)

## Overview

Post Report Assistant (Version 2.3.0) is a Chrome extension that runs only when the user opens the extension popup and explicitly starts a run on the current `facebook.com` tab.

## Single Purpose
The single, core purpose of this extension is to assist the user in managing and automating repetitive reporting workflows on the currently active Facebook tab. The extension does not run in the background on arbitrary pages.

## Data Handling

- The extension only reads page interface text (DOM) and clicks visible action controls strictly on the current `facebook.com` tab to perform the user-initiated workflow.
- The extension uses minimal local session storage (Chrome storage) to track progress:
  - boolean state of whether a run is active
  - the local reported-item count
  - the tab id associated with the active run
  - the last status message for UI updates
- **No Remote Transmission**: The extension does absolutely not transmit, share, or upload any stored data to any remote server. It operates 100% locally on the user's browser.
- **No Personal Data Collection**: The extension does not collect, track, or read account credentials, payment data, personal messages, or browsing history outside the active workflow tab.

## Sharing

- No local session data is sold, traded, or shared with third parties under any circumstances.

## Retention

- Session state remains purely in local Chrome extension storage. This data is automatically cleared when the user removes the extension or clears their extension storage data.

## Support Contact

- hieunt7702 (Please reach out via the developer support email provided on the Web Store listing).
