#!/bin/bash
set -e
curl -fsSL https://get.pnpm.io/install.sh | PNPM_VERSION=10.0.0 sh -
export PATH="$HOME/.local/share/pnpm:$PATH"
pnpm install
pnpm --filter @workspace/velmora run build
