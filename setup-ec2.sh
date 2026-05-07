#!/bin/bash
# Setup script for iRepair dev environment

# Update system
sudo apt-get update
sudo apt-get install -y curl git

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
export PNPM_HOME="/home/ubuntu/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Clone your repo (you'll need to add your git remote)
echo "Setup complete!"
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"
