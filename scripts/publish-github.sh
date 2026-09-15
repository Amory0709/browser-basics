#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${REPO_NAME:-browser-basics}"
GITHUB_USER="${GITHUB_USER:-mhan8}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: GITHUB_TOKEN not set."
  echo "Create a classic PAT with 'repo' scope at https://github.com/settings/tokens"
  exit 1
fi

auth_header="Authorization: Bearer ${GITHUB_TOKEN}"

echo "Checking GitHub user..."
resolved_user="$(curl -fsSL -H "${auth_header}" https://api.github.com/user | jq -r .login)"
if [[ -n "${resolved_user}" && "${resolved_user}" != "null" ]]; then
  GITHUB_USER="${resolved_user}"
fi

echo "Using GitHub account: ${GITHUB_USER}"

repo_status="$(curl -s -o /tmp/repo-check.json -w "%{http_code}" \
  -H "${auth_header}" \
  "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}")"

if [[ "${repo_status}" == "404" ]]; then
  echo "Creating repository ${GITHUB_USER}/${REPO_NAME}..."
  curl -fsSL -H "${auth_header}" \
    -H "Accept: application/vnd.github+json" \
    -X POST https://api.github.com/user/repos \
    -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Multiplayer Yjs collaborative learning playground (browser basics)\",\"private\":false,\"auto_init\":false}" \
    > /tmp/create-repo.json
  echo "Repository created."
elif [[ "${repo_status}" == "200" ]]; then
  echo "Repository already exists."
else
  echo "Failed to inspect repository (HTTP ${repo_status})."
  cat /tmp/repo-check.json
  exit 1
fi

git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "Pushing code..."
git push -u origin main

pages_status="$(curl -s -o /tmp/pages-check.json -w "%{http_code}" \
  -H "${auth_header}" \
  "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/pages")"

if [[ "${pages_status}" == "404" ]]; then
  echo "Enabling GitHub Pages (workflow build)..."
  curl -fsSL -H "${auth_header}" \
    -H "Accept: application/vnd.github+json" \
    -X POST "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/pages" \
    -d '{"build_type":"workflow"}' \
    > /tmp/pages-enable.json || true
fi

echo
echo "Done."
echo "Repo: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo "Pages (after first workflow): https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo
echo "Next steps:"
echo "1. Deploy WebSocket server on Render using render.yaml (free tier)."
echo "2. Set repo variable VITE_WS_URL=wss://<your-render-service>.onrender.com"
echo "3. Re-run the Pages workflow or push again to rebuild frontend."
