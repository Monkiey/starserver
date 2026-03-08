/**
 * popup.js — Open in StarServer extension
 *
 * Handles:
 *  - Loading / saving the configured StarServer base URL
 *  - Reading the clipboard and pre-filling the search input
 *  - Debounced search via the StarServer /api/ai/search endpoint
 *  - Rendering results and opening the correct StarServer page in a new tab
 *
 * Compatible with Chrome/Edge/Brave (Manifest V3) and Safari (Manifest V2).
 */

'use strict';

// ── Cross-browser API shim ────────────────────────────────────────────────────
// Safari exposes the WebExtension API as `browser`; Chrome exposes `chrome`.
const api = typeof browser !== 'undefined' ? browser : chrome;

// ── Storage keys ─────────────────────────────────────────────────────────────
const KEY_SERVER_URL = 'serverUrl';
const KEY_PENDING = 'pendingSearch';

// ── UI constants ──────────────────────────────────────────────────────────────
/** Maximum characters shown in the clipboard preview banner. */
const MAX_CLIPBOARD_PREVIEW_LENGTH = 80;
/** Maximum number of search result cards shown at once. */
const MAX_VISIBLE_RESULTS = 15;

// ── Debounce helper ───────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Slug builder (mirrors src/lib/utils.ts → getSlug) ────────────────────────
function buildSlug(id, name) {
  const regex = /([^\x00-\x7F]|[&$+,:;=?@#\s<>[\]{}|\\^%])+/gm;
  return `${name.toLowerCase().replace(regex, '-')}-${id}`;
}

// ── Build the full StarServer URL for a show ──────────────────────────────────
function buildShowUrl(serverUrl, show) {
  const base = serverUrl.replace(/\/$/, '');
  const name =
    show.title ?? show.name ?? show.original_title ?? show.original_name ?? '';
  const section = show.media_type === 'tv' ? 'tv-shows' : 'movies';
  return `${base}/${section}/${buildSlug(show.id, name)}`;
}

// ── DOM refs ─────────────────────────────────────────────────────────────────
const serverUrlInput = document.getElementById('server-url');
const saveUrlBtn = document.getElementById('save-url');
const urlHint = document.getElementById('url-hint');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const clipboardBanner = document.getElementById('clipboard-banner');
const clipboardText = document.getElementById('clipboard-text');
const useClipboardBtn = document.getElementById('use-clipboard');
const resultsList = document.getElementById('results-list');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const noResultsState = document.getElementById('no-results-state');
const noResultsMsg = document.getElementById('no-results-msg');
const openStarserverLink = document.getElementById('open-starserver');
const openSettingsBtn = document.getElementById('open-settings');

// ── State ─────────────────────────────────────────────────────────────────────
let currentServerUrl = '';
let settingsVisible = false;
const configSection = document.getElementById('config-section');

// ── Load saved server URL ─────────────────────────────────────────────────────
async function loadServerUrl() {
  const result = await api.storage.local.get(KEY_SERVER_URL);
  const saved = result[KEY_SERVER_URL] ?? '';
  currentServerUrl = saved;
  serverUrlInput.value = saved;

  if (saved) {
    try {
      urlHint.textContent = `Connected to ${new URL(saved).hostname}`;
    } catch {
      urlHint.textContent = 'Connected to your server';
    }
    urlHint.className = 'hint success';
    openStarserverLink.href = saved;
    configSection.hidden = true; // collapse when configured
  } else {
    urlHint.textContent = 'Enter your StarServer URL to get started.';
    urlHint.className = 'hint';
    openStarserverLink.href = '#';
    configSection.hidden = false;
    searchInput.disabled = true;
    searchInput.placeholder = 'Save your server URL first…';
  }
}

// ── Save server URL ───────────────────────────────────────────────────────────
async function saveServerUrl() {
  const raw = serverUrlInput.value.trim();
  if (!raw) {
    urlHint.textContent = 'Please enter a URL.';
    urlHint.className = 'hint error';
    return;
  }
  try {
    const parsed = new URL(raw);
    const normalized = parsed.origin; // strip trailing path
    await api.storage.local.set({ [KEY_SERVER_URL]: normalized });
    currentServerUrl = normalized;
    serverUrlInput.value = normalized;
    urlHint.textContent = `Saved! Connected to ${parsed.hostname}`;
    urlHint.className = 'hint success';
    openStarserverLink.href = normalized;
    configSection.hidden = true;
    searchInput.disabled = false;
    searchInput.placeholder = 'Search movies & TV shows…';
  } catch {
    urlHint.textContent = 'Invalid URL — include https://';
    urlHint.className = 'hint error';
  }
}

// ── Toggle settings panel ─────────────────────────────────────────────────────
function toggleSettings() {
  settingsVisible = !settingsVisible;
  configSection.hidden = !settingsVisible;
}

// ── Read clipboard and offer to pre-fill ─────────────────────────────────────
async function tryReadClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const trimmed = text
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, MAX_CLIPBOARD_PREVIEW_LENGTH);
    if (!trimmed || trimmed.length < 2) return;
    clipboardText.textContent = `"${trimmed}"`;
    clipboardBanner.hidden = false;
    // Auto-search when popup opens if the input is still empty
    if (!searchInput.value.trim()) {
      searchInput.value = trimmed;
      clearBtn.hidden = false;
      await performSearch(trimmed);
    }
  } catch {
    // Clipboard read may be denied — silently ignore
  }
}

// ── Show / hide states ────────────────────────────────────────────────────────
function showState(state) {
  emptyState.hidden = state !== 'empty';
  loadingState.hidden = state !== 'loading';
  noResultsState.hidden = state !== 'no-results';
  resultsList.hidden = state !== 'results';
}

// ── Render a single result card ───────────────────────────────────────────────
function renderResult(show) {
  const name =
    show.title ??
    show.name ??
    show.original_title ??
    show.original_name ??
    'Unknown';
  const year = (show.release_date ?? show.first_air_date ?? '').slice(0, 4);
  const isTV = show.media_type === 'tv';

  const li = document.createElement('li');
  li.setAttribute('role', 'listitem');

  const btn = document.createElement('button');
  btn.className = 'result-item';
  btn.setAttribute(
    'aria-label',
    `Open ${name}${year ? ` (${year})` : ''} in StarServer`,
  );

  // Poster
  if (show.poster_path) {
    const img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w92${show.poster_path}`;
    img.alt = name;
    img.className = 'result-poster';
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(placeholder());
    btn.appendChild(img);
  } else {
    btn.appendChild(placeholder());
  }

  // Info
  const info = document.createElement('div');
  info.className = 'result-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'result-name';
  nameEl.textContent = name;
  info.appendChild(nameEl);

  const meta = document.createElement('div');
  meta.className = 'result-meta';

  const badge = document.createElement('span');
  badge.className = `badge ${isTV ? 'badge-tv' : 'badge-movie'}`;
  badge.textContent = isTV ? 'TV' : 'Movie';
  meta.appendChild(badge);

  if (year) {
    const yearEl = document.createElement('span');
    yearEl.className = 'result-year';
    yearEl.textContent = year;
    meta.appendChild(yearEl);
  }
  info.appendChild(meta);
  btn.appendChild(info);

  // Arrow
  const arrow = document.createElement('span');
  arrow.className = 'result-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  btn.appendChild(arrow);

  // Click → open tab
  btn.addEventListener('click', () => {
    const url = buildShowUrl(currentServerUrl, show);
    api.tabs.create({ url });
    window.close();
  });

  li.appendChild(btn);
  return li;
}

function placeholder() {
  const div = document.createElement('div');
  div.className = 'result-poster-placeholder';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="12" y1="7" x2="12" y2="17"/></svg>`;
  return div;
}

// ── Perform search ────────────────────────────────────────────────────────────
async function performSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    showState('empty');
    return;
  }
  if (!currentServerUrl) {
    showState('empty');
    return;
  }

  showState('loading');

  try {
    const response = await fetch(`${currentServerUrl}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmed, mode: 'title' }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const results = data.results ?? [];

    if (!results.length) {
      noResultsMsg.textContent = `No results for "${trimmed}"`;
      showState('no-results');
      return;
    }

    resultsList.innerHTML = '';
    results.slice(0, MAX_VISIBLE_RESULTS).forEach((show) => {
      resultsList.appendChild(renderResult(show));
    });
    showState('results');
  } catch (err) {
    noResultsMsg.textContent =
      'Could not reach StarServer. Check the URL in Settings.';
    showState('no-results');
    console.error('[StarServer ext]', err);
  }
}

// ── Debounced wrapper ─────────────────────────────────────────────────────────
const debouncedSearch = debounce((q) => performSearch(q), 350);

// ── Event wiring ──────────────────────────────────────────────────────────────
saveUrlBtn.addEventListener('click', saveServerUrl);

serverUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveServerUrl();
});

searchInput.addEventListener('input', () => {
  const val = searchInput.value;
  clearBtn.hidden = !val;
  debouncedSearch(val);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    performSearch(searchInput.value);
  }
  if (e.key === 'Escape') {
    searchInput.value = '';
    clearBtn.hidden = true;
    showState('empty');
  }
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.hidden = true;
  showState('empty');
  searchInput.focus();
});

useClipboardBtn.addEventListener('click', async () => {
  const text = clipboardText.textContent.replace(/^"|"$/g, '');
  searchInput.value = text;
  clearBtn.hidden = false;
  clipboardBanner.hidden = true;
  await performSearch(text);
  searchInput.focus();
});

openSettingsBtn.addEventListener('click', toggleSettings);

// ── Initialise ────────────────────────────────────────────────────────────────
(async () => {
  await loadServerUrl();
  showState('empty');

  // Check if there's a pending search query from the context menu.
  // Use storage.session when available (Chrome MV3); fall back to storage.local
  // for Safari, which does not support storage.session.
  const pendingStore = api.storage.session ?? api.storage.local;
  const result = await pendingStore.get(KEY_PENDING);
  const pending = result[KEY_PENDING];
  if (pending) {
    await pendingStore.remove(KEY_PENDING);
    searchInput.value = pending;
    clearBtn.hidden = false;
    await performSearch(pending);
    searchInput.focus();
    return;
  }

  await tryReadClipboard();

  // Focus search input
  searchInput.focus();
})();
