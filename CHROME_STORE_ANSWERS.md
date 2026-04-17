# Guide to Publishing to Chrome Web Store (Updated for v2.3.0)

This document contains the fully optimized answers and declarations for the "Post Report Assistant" extension. **Copy and paste these exact English details** into the Chrome Web Store Developer Dashboard to ensure a 100% fast approval rate and avoid any rejections based on styling or privacy policy violations.

---

## 1. Store Listing Details (Product Details)

Fill in the information exactly as specified below:

- **Name:** Post Report Assistant
- **Summary:** Quickly assists in reporting Facebook posts. Runs locally on the active tab and supports multiple languages.
- **Detailed Description (Description):**
  Post Report Assistant is a productivity tool designed to help Facebook users easily automate the reporting workflow for posts containing spam, fraud, or false information.

  **Key Features:**
  - Full multi-language support (English & Vietnamese are detected automatically based on the user's browser language).
  - Clean and crisp interface perfectly sized at 640x400. It eliminates any horizontal/vertical scrollbars for a modern and completely smooth user experience.
  - Runs directly on your current active Facebook tab when the "Start" button is clicked.
  - Automates the clicking process for reporting reasons (defaulting to "Scam, fraud, or false information").
  - 100% Transparent Privacy: Zero user data collection, background tracking, or remote server connections. Everything is stored locally.

  **How to Use:**
  1. Open a Facebook page containing the post you wish to report.
  2. Open the extension from your Chrome toolbar and click "Start on this tab".
  3. The extension will automatically interact with the page elements. You can click "Stop" at any time to immediately halt the workflow.

- **Category:** Productivity (or Social & Communication)

---

## 2. Store Assets (Images & Branding)

- **Icons:** Upload your 16x16, 32x32, 48x48, and 128x128 icons.
- **Screenshots (Extremely Important):** 
  Because version 2.3.0 is precisely optimized to fit 640x400 without overflowing, ensure you capture the entire clean interface.
  1. **Main UI:** A high-quality capture of the new, fully visible and clean popup (remove any old screenshots).
  2. **Active State:** Add at least one screenshot showing the extension in the "Running" state.
- **Demo Video (Mandatory):** Extensions that simulate user clicks are strictly monitored and often flagged by review bots. **You must include a link to an unlisted YouTube video** demonstrating how the extension securely operates on Facebook. This step is practically required for automation tools to pass the Google "Manual Review" quickly.

---

## 3. Privacy & Security Declarations

To ensure your extension passes through the review team smoothly, provide these precise justifications in the "Privacy" tab:

### Single Purpose Description
"This extension assists users in automating the repetitive clicks required to report inappropriate posts strictly on their currently active Facebook tab. It executes solely upon user request to streamline personal content moderation tasks."

### Permissions Justification
- **Host Permissions (`*://*.facebook.com/*`) & content_scripts:** 
  "Necessary to inject a content script that manipulates specific DOM elements for the post reporting workflow on Facebook. It operates strictly within Facebook URLs and handles UI states robustly."
- **activeTab & scripting:** 
  "Used to access the currently focused tab's URL to verify it is Facebook before injecting the required automation script, exclusively triggered via user interaction in the popup."
- **storage:** 
  "Used strictly for local session management (persisting the start/stop state and counted items locally in the user's browser). No data ever leaves the local machine."

### Data Usage Details (Crucial Step)  
You must accurately declare your data usage:
- **Do you collect or use user data?** Select **NO**.
- **Do you use remote code?** Select **NO**. 

### Privacy Policy URL
- You must provide a valid link to a Privacy Policy page (e.g., hosted on GitHub Pages, Google Sites, or your personal blog). Point it directly to your `PRIVACY_POLICY.md` content which outlines that NO data is remotely collected.

---

## 4. Developer Commitments

At the final step of the store listing:
- Ensure you agree to all program policies.
- Check the compliance boxes declaring your extension DOES NOT sell data, DOES NOT manipulate unrelated content, and DOES NOT involve credit or lending applications.

Following this exact guide will make your Chrome Store submission clear, professional, and compliant, significantly boosting your chances of passing the review within 24 hours.
