#!/usr/bin/env bash

# vibe coded because no thanks

set -euo pipefail

SRC_DIR="web"
DST_DIR="tauri-app"

# Phrase that exempts a file from being copied
EXEMPTION_PHRASE="single"

# Hardcoded exclusions (paths relative to SRC_DIR)
EXCLUDE_PATHS=(
  "node_modules"
  ".nuxt"
  "server"
  "nuxt.config.ts"
  "package.json"
  "package-lock.json"
)

# Convert to absolute paths based on CWD
SRC_DIR="$(realpath "$SRC_DIR")"
DST_DIR="$(realpath "$DST_DIR")"

# Ensure destination exists
mkdir -p "$DST_DIR"

GITIGNORE_FILE="$DST_DIR/.gitignore"

# Start fresh .gitignore
: > "$GITIGNORE_FILE"

EXCLUDE_REGEX=$(printf "|%s" "${EXCLUDE_PATHS[@]}")
EXCLUDE_REGEX="${EXCLUDE_REGEX:1}"

is_excluded() {
  local rel_path="$1"
  [[ "$rel_path" =~ (^|/)$EXCLUDE_REGEX($|/) ]]
}

add_to_gitignore() {
  echo "$1" >> "$GITIGNORE_FILE"
}

find "$SRC_DIR" -type f | while IFS= read -r file; do
  rel_path="${file#$SRC_DIR/}"
  dest_file="$DST_DIR/$rel_path"

  # Skip excluded paths entirely (not copied, not tracked)
  if is_excluded "$rel_path"; then
    continue
  fi

  # Read first line safely
  first_line=""
  if [[ -s "$file" ]]; then
    IFS= read -r first_line < "$file" || true
  fi

  # Skip files with exemption phrase (NOT copied, NOT added)
  if [[ "$first_line" == *"$EXEMPTION_PHRASE"* ]]; then
    # if file exists in destination, delete it
    if [[ -e "$dest_file" ]]; then
      first_line_dest=""
      if [[ -s "$dest_file" ]]; then
        IFS= read -r first_line_dest < "$dest_file" || true
      fi

      if [[ "$first_line_dest" != *"$EXEMPTION_PHRASE"* ]]; then
        rm -f "$dest_file"
      fi
    fi
    continue
  fi

  mkdir -p "$(dirname "$dest_file")"

  cp "$file" "$dest_file"

  # NEW BEHAVIOR: track copied files
  add_to_gitignore "$rel_path"
done

# Deduplicate .gitignore
sort -u "$GITIGNORE_FILE" -o "$GITIGNORE_FILE"
