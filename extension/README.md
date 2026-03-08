# Open in StarServer — Browser Extension

A Chrome / Edge / Brave (Manifest V3) browser extension that lets you instantly search for movies and TV shows on your StarServer instance — directly from the browser.

## Features

| Feature | How to use |
|---|---|
| **Clipboard auto-detect** | Copy any movie or TV-show title, then open the extension popup. The title is pre-filled and searched automatically. |
| **Right-click → Open in StarServer** | Select any text on any page, right-click, and choose **"Open '[title]' in StarServer"**. |
| **Popup search** | Type directly in the popup search box to search in real time. |
| **One-click watch** | Click a result to open the show's page on StarServer in a new tab. |

## Installation

> The extension is a plain folder — no build step needed.

### Chrome / Edge / Brave

1. Open your browser and navigate to `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select this `extension/` folder.

### Firefox

Firefox requires Manifest V2 — a separate package would be needed for native support. As a workaround you can use [Firefox's temporary extension loading](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) via `about:debugging`.

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
├── manifest.json     # Extension manifest (Manifest V3)
├── background.js     # Service worker — context menu handler
├── popup.html        # Extension popup markup
├── popup.css         # Popup styles
├── popup.js          # Popup logic (clipboard, search, render)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
