#!/usr/bin/env bash
# Runs on the host before the devcontainer starts. Two jobs:
#   1. make sure ~/.claude{,.json} exist so the bind-mounts in
#      docker-compose.yaml don't create them as root-owned directories.
#   2. seed .devcontainer/.env with the parameters docker-compose needs,
#      without clobbering any values the user has already set.
set -euo pipefail

mkdir -p "$HOME/.claude"
touch "$HOME/.claude.json"

env_file=".devcontainer/.env"
mkdir -p "$(dirname "$env_file")"
touch "$env_file"

# Add `KEY=VALUE` only if no line for KEY is already in the file. Lets us
# evolve the set of managed defaults over time without overwriting user
# customizations or stale-but-deliberate values (e.g. WORKSPACE_NAME after
# the user has renamed the checkout).
ensure_var() {
    local key="$1" value="$2"
    if ! grep -q "^${key}=" "$env_file"; then
        echo "${key}=${value}" >> "$env_file"
    fi
}

# Used by docker-compose.yaml to build the bind-mount path. Defaults to the
# current directory name — matches whatever you cloned into.
ensure_var WORKSPACE_NAME "$(basename "$PWD")"

