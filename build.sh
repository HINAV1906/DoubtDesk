#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "--- 🚀 Starting Render Build Script ---"

# Install Python dependencies
pip install -r requirements.txt

# Build React Frontend
if [ -d "frontend" ]; then
  echo "--- 📦 Building Frontend React SPA ---"
  cd frontend
  npm install
  npm run build
  cd ..
fi

# Collect Static files & Apply Migrations
echo "--- ⚙️ Running Django Collectstatic & Migrations ---"
python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

# Seed Initial Demo Database Accounts
echo "--- 🔑 Seeding Initial Database Accounts ---"
python backend/seed_db.py || true

echo "--- ✅ Build Complete Successfully ---"
