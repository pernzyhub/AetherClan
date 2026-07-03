#!/bin/bash
# Quick Test Script for AetherClan Configuration

echo "🔍 AetherClan Configuration Verification"
echo "========================================"
echo ""

# Check if files exist
echo "📁 Checking file structure..."
files=(
  "js/config.js"
  "js/utils.js"
  "js/admin.js"
  "js/login.js"
  "js/dashboard.js"
  "js/rankings.js"
  "js/requests.js"
  "api/register.js"
  "SETUP_GUIDE.md"
  ".env.example"
  "CODE_CONSOLIDATION_REPORT.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
  fi
done

echo ""
echo "📝 Checking script references in HTML files..."
html_files=(
  "index.html"
  "dashboard.html"
  "admin-panel.html"
  "rankings.html"
  "requests.html"
  "ledger.html"
  "assist.html"
)

for html in "${html_files[@]}"; do
  if grep -q "js/config.js" "$html" && grep -q "js/utils.js" "$html"; then
    echo "✅ $html has config.js and utils.js"
  else
    echo "⚠️ $html might be missing scripts"
  fi
done

echo ""
echo "✅ Verification complete!"
echo ""
echo "📖 Next steps:"
echo "1. Read SETUP_GUIDE.md"
echo "2. Read CODE_CONSOLIDATION_REPORT.md"
echo "3. Copy .env.example to .env.local"
echo "4. Add your Supabase credentials"
echo "5. Test the application"
echo ""
