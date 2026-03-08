/**
 * background.js — Open in StarServer extension service worker
 *
 * Registers a context-menu item so users can right-click any selected text
 * and search for it in StarServer directly.
 *
 * Compatible with Chrome/Edge/Brave (Manifest V3) and Safari (Manifest V2).
 */

'use strict';

// ── Cross-browser API shim ────────────────────────────────────────────────────
// Safari exposes the WebExtension API as `browser`; Chrome exposes `chrome`.
// Both are available in most modern browsers, but we prefer the standard one.
const api = typeof browser !== 'undefined' ? browser : chrome;

const MENU_ID     = 'open-in-starserver';
const KEY_STORAGE = 'serverUrl';
// Fallback key used when storage.session is unavailable (e.g. Safari)
const KEY_PENDING = 'pendingSearch';

// ── Pending-search helpers ────────────────────────────────────────────────────
// Use storage.session when available (Chrome); fall back to storage.local so
// the feature works in Safari, which does not support storage.session.
async function setPendingSearch(text) {
  const store = api.storage.session ?? api.storage.local;
  await store.set({ [KEY_PENDING]: text });
}

async function clearPendingSearch() {
  const store = api.storage.session ?? api.storage.local;
  await store.remove(KEY_PENDING);
}

// ── Create context-menu on install / startup ──────────────────────────────────
function registerContextMenu() {
  api.contextMenus.removeAll(() => {
    api.contextMenus.create({
      id:       MENU_ID,
      title:    'Open "%s" in StarServer',
      contexts: ['selection'],
    });
  });
}

api.runtime.onInstalled.addListener(registerContextMenu);
api.runtime.onStartup.addListener(registerContextMenu);

// ── Handle context-menu clicks ────────────────────────────────────────────────
api.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectedText = (info.selectionText ?? '').trim();
  if (!selectedText) return;

  const stored    = await api.storage.local.get(KEY_STORAGE);
  const serverUrl = stored[KEY_STORAGE];

  if (!serverUrl) {
    // No server URL configured — open the extension popup so the user can set it
    await api.action?.openPopup?.().catch(() => {
      // openPopup is not available in all browsers — fall back silently
    });
    return;
  }

  // Store the query so the popup can pick it up when it opens, then open popup
  await setPendingSearch(selectedText);

  // Try to open the popup. If the browser doesn't support openPopup, fall back
  // to opening StarServer's search URL directly (best effort).
  try {
    await api.action.openPopup();
  } catch {
    await clearPendingSearch();
    const base = serverUrl.replace(/\/$/, '');
    await api.tabs.create({
      url: `${base}/?q=${encodeURIComponent(selectedText)}`,
    });
  }
});
