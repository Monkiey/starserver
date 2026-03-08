#!/usr/bin/env bash
# build-safari.sh — Convert "Open in StarServer" to a Safari Web Extension
#
# Requirements:
#   • macOS (Ventura 13+ recommended)
#   • Xcode 14+ with Command Line Tools installed
#     (xcode-select --install)
#
# Usage:
#   cd extension/
#   chmod +x build-safari.sh
#   ./build-safari.sh
#
# The script assembles a clean copy of the extension that uses the Safari
# Manifest V2 format, then invokes xcrun safari-web-extension-converter to
# generate a ready-to-build Xcode project inside ../StarServerSafariExtension/.
#
# After the script finishes:
#   1. Open  ../StarServerSafariExtension/*.xcodeproj  in Xcode.
#   2. Select your Team in Signing & Capabilities for both the App and
#      Extension targets.
#   3. Build & Run (⌘R) on the macOS destination.
#   4. Enable the extension in Safari → Settings → Extensions.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/StarServerSafariExtension"
BUILD_DIR="$(mktemp -d)"

echo "▶ Preparing extension source in ${BUILD_DIR} …"

# Copy all extension assets to the temp directory
cp -r "${SCRIPT_DIR}/"* "${BUILD_DIR}/"

# Swap in the Safari (Manifest V2) manifest
cp "${BUILD_DIR}/manifest.safari.json" "${BUILD_DIR}/manifest.json"

# Remove files that are not needed in the packaged extension
rm -f "${BUILD_DIR}/manifest.safari.json"
rm -f "${BUILD_DIR}/build-safari.sh"
rm -f "${BUILD_DIR}/README.md"

echo "▶ Running safari-web-extension-converter …"

xcrun safari-web-extension-converter \
  --project-location "${PROJECT_DIR}" \
  --app-name "Open in StarServer" \
  --bundle-identifier "com.starserver.open-in-starserver" \
  --force \
  --no-open \
  "${BUILD_DIR}"

# Clean up temp dir
rm -rf "${BUILD_DIR}"

echo ""
echo "✅  Done!  Xcode project created at:"
echo "    ${PROJECT_DIR}"
echo ""
echo "Next steps:"
echo "  1. Open ${PROJECT_DIR}/*.xcodeproj in Xcode"
echo "  2. Set your Team in Signing & Capabilities for both targets"
echo "  3. Build & Run (⌘R) on the macOS destination"
echo "  4. Enable the extension: Safari → Settings → Extensions"
