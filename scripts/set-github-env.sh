#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/set-github-env.sh [--env ENVIRONMENT]

Prompts for the project's GitHub Actions variables and secrets, then writes them
to the current repository or the specified deployment environment.

Examples:
  ./scripts/set-github-env.sh
  ./scripts/set-github-env.sh --env production
EOF
}

ENV_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --env" >&2
        exit 1
      fi
      ENV_NAME="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required but not installed." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "You are not authenticated with gh. Run: gh auth login" >&2
  exit 1
fi

set_variable() {
  local name="$1"
  local value="$2"

  if [[ -n "$ENV_NAME" ]]; then
    gh variable set "$name" --env "$ENV_NAME" --body "$value"
  else
    gh variable set "$name" --body "$value"
  fi
}

set_secret() {
  local name="$1"
  local value="$2"

  if [[ -n "$ENV_NAME" ]]; then
    gh secret set "$name" --env "$ENV_NAME" --body "$value"
  else
    gh secret set "$name" --body "$value"
  fi
}

prompt_value() {
  local label="$1"
  local value=""
  read -r -p "$label: " value
  printf '%s' "$value"
}

prompt_secret() {
  local label="$1"
  local value=""
  read -r -s -p "$label: " value
  printf '\n'
  printf '%s' "$value"
}

echo "Setting GitHub ${ENV_NAME:+environment }values${ENV_NAME:+ for $ENV_NAME}."
echo "Leave nothing blank unless you intentionally want to overwrite a value with empty text."
echo

NEXT_PUBLIC_SITE_URL="$(prompt_value 'NEXT_PUBLIC_SITE_URL')"
NEXT_PUBLIC_SUPABASE_URL="$(prompt_value 'NEXT_PUBLIC_SUPABASE_URL')"
NEXT_PUBLIC_SUPABASE_ANON_KEY="$(prompt_value 'NEXT_PUBLIC_SUPABASE_ANON_KEY')"
SUPABASE_SERVICE_ROLE_KEY="$(prompt_secret 'SUPABASE_SERVICE_ROLE_KEY')"
STRIPE_SECRET_KEY="$(prompt_secret 'STRIPE_SECRET_KEY')"
STRIPE_WEBHOOK_SECRET="$(prompt_secret 'STRIPE_WEBHOOK_SECRET')"

echo
echo "Writing variables..."
set_variable "NEXT_PUBLIC_SITE_URL" "$NEXT_PUBLIC_SITE_URL"
set_variable "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
set_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "Writing secrets..."
set_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
set_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
set_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

echo
echo "Done."
