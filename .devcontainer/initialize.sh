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
# current directory name — usually `claude-redact`, but matches whatever
# you cloned into.
ensure_var WORKSPACE_NAME "$(basename "$PWD")"

# Keying material for the fake generator. When set, every fake is a
# deterministic function of (seed, entity_type, original) — same secret
# always produces the same fake, across rebuilds, so the model doesn't see
# previously-stable references suddenly change identity mid-conversation.
# We mint a fresh 256-bit hex value on first run. Subsequent runs preserve
# whatever's already there, so the binding survives container rebuilds.
# Treat this file as you would a password manager export — anyone with the
# seed can mount a known-plaintext attack against observed fakes.
if ! grep -q "^CLAUDE_REDACT_SEED=" "$env_file"; then
    if command -v openssl >/dev/null 2>&1; then
        seed="$(openssl rand -hex 32)"
    else
        # /dev/urandom fallback — od + tr is portable across BSD/GNU.
        seed="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
    fi
    echo "CLAUDE_REDACT_SEED=${seed}" >> "$env_file"
fi
