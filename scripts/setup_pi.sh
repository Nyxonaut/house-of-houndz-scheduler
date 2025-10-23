#!/usr/bin/env bash
set -euo pipefail

# This script prepares a Raspberry Pi for the House of Houndz Scheduler stack.
# It installs system dependencies for Git, Python, PostgreSQL, Node.js, and Docker.

sudo apt-get update
sudo apt-get install -y git curl build-essential libpq-dev python3 python3-venv python3-pip

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Node.js (using NodeSource for current LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker + Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"

sudo apt-get install -y docker-compose-plugin

echo "Raspberry Pi setup complete. Log out and back in to apply docker group membership."

