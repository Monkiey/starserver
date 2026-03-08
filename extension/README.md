# Open in StarServer — Browser Extension

A Chrome / Edge / Brave / **Safari** browser extension that lets you instantly search for movies and TV shows on your StarServer instance — directly from the browser.

## Features

| Feature | How to use |
|---|---|
| **Clipboard auto-detect** | Copy any movie or TV-show title, then open the extension popup. The title is pre-filled and searched automatically. |
| **Right-click → Open in StarServer** | Select any text on any page, right-click, and choose **"Open '[title]' in StarServer"**. |
| **Popup search** | Type directly in the popup search box to search in real time. |
| **One-click watch** | Click a result to open the show's page on StarServer in a new tab. |

## Installation

> The extension is a plain folder — no build step needed for Chrome/Edge/Brave.

### Chrome / Edge / Brave

1. Open your browser and navigate to `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select this `extension/` folder.

### Safari (macOS)

Safari requires the extension to be wrapped in a native macOS app.  
The included `build-safari.sh` script does this automatically using Apple's `xcrun safari-web-extension-converter` tool.

**Prerequisites:** macOS · Xcode 14+ (`xcode-select --install`)

```bash
cd extension/
chmod +x build-safari.sh
./build-safari.sh
```

This will:
1. Assemble a clean copy of the extension using the Safari-compatible **Manifest V2** (`manifest.safari.json`).
2. Run `xcrun safari-web-extension-converter` to generate a ready-to-build Xcode project at `../StarServerSafariExtension/`.

**After the script finishes:**
1. Open `../StarServerSafariExtension/*.xcodeproj` in Xcode.
2. Select your **Team** in *Signing & Capabilities* for both the App and Extension targets.
3. **Build & Run** (⌘R) on the macOS destination.
4. Enable the extension in **Safari → Settings → Extensions**.

### Firefox

The extension uses `browser.*` WebExtension APIs and should load in Firefox without changes:

1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select any file inside the `extension/` folder.

## First-time setup

1. Click the **StarServer** extension icon in your browser toolbar.
2. In the **Server URL** field enter the full URL of your StarServer deployment, e.g. `https://watch.example.com`.
3. Click **Save**.

The extension will remember the URL across browser restarts.

## How it works

1. When the popup opens it reads the clipboard (the browser will ask for permission once).
2. If clipboard text is found it is placed into the search box and a live search is performed against the StarServer `/api/ai/search` endpoint.
3. Results are rendered as a scrollable card list.  Clicking a card constructs the correct StarServer show URL and opens it in a new tab.

## Permissions used

| Permission | Reason |
|---|---|
| `clipboardRead` | Read the copied title when the popup opens |
| `contextMenus` | Add the right-click "Open in StarServer" item |
| `storage` | Persist the configured StarServer URL |
| `tabs` | Open the show's page in a new tab |

No data is ever sent to third-party servers — all searches go directly to **your own** StarServer instance.

## File structure

```
extension/
├── manifest.json          # Manifest V3 — Chrome / Edge / Brave
├── manifest.safari.json   # Manifest V2 — used by build-safari.sh for Safari
├── build-safari.sh        # Converts extension → Safari Xcode project (macOS only)
├── background.js          # Service worker / background page — context menu handler
├── popup.html             # Extension popup markup
├── popup.css              # Popup styles
├── popup.js               # Popup logic (clipboard, search, render)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

