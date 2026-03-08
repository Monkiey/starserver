/**
 * background.js — Open in StarServer extension service worker
 *
 * Registers a context-menu item so users can right-click any selected text
 * and search for it in StarServer directly.
 */

'use strict';

const MENU_ID      = 'open-in-starserver';
const KEY_STORAGE  = 'serverUrl';

// ── Create context-menu on install / startup ──────────────────────────────────
function registerContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id:       MENU_ID,
      title:    'Open "%s" in StarServer',
      contexts: ['selection'],
    });
  });
}

chrome.runtime.onInstalled.addListener(registerContextMenu);
chrome.runtime.onStartup.addListener(registerContextMenu);

// ── Handle context-menu clicks ────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectedText = (info.selectionText ?? '').trim();
  if (!selectedText) return;

  const stored = await chrome.storage.local.get(KEY_STORAGE);
  const serverUrl = stored[KEY_STORAGE];

  if (!serverUrl) {
    // No server URL configured — open the extension popup so the user can configure it
    await chrome.action.openPopup?.().catch(() => {
      // openPopup is not available in all browsers — fall back silently
    });
    return;
  }

  // Store the query so the popup can pick it up when it opens, then open popup
  await chrome.storage.session.set({ pendingSearch: selectedText });

  // Try to open the popup. If the browser doesn't support openPopup, fall back
  // to opening StarServer's search URL directly (best effort).
  try {
    await chrome.action.openPopup();
  } catch {
    const base = serverUrl.replace(/\/$/, '');
    await chrome.tabs.create({
      url: `${base}/?q=${encodeURIComponent(selectedText)}`,
    });
  }
});
