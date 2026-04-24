#!/bin/bash

# GrammarQuest Pre-Deployment Setup Script
# This script prepares your app for Vercel deployment

echo "🚀 GrammarQuest - Vercel Deployment Setup"
echo "=========================================="
echo ""

# Step 1: Clean up dependencies
echo "📦 Step 1: Cleaning up dependencies..."
rm -rf node_modules
npm install
echo "✅ Dependencies updated"
echo ""

# Step 2: Remove unused lovable folder (optional)
echo "🧹 Step 2: Removing unused Lovable folder..."
if [ -d "src/integrations/lovable" ]; then
    rm -rf src/integrations/lovable/
    echo "✅ Lovable folder removed"
else
    echo "⏭️  Lovable folder not found (already removed)"
fi
echo ""

# Step 3: Verify lovable is removed
echo "🔍 Step 3: Verifying Lovable references removed..."
LOVABLE_COUNT=$(grep -r "lovable\|Lovable" src/ 2>/dev/null | grep -v node_modules | wc -l)
if [ "$LOVABLE_COUNT" -eq 0 ]; then
    echo "✅ No Lovable references found in source code"
else
    echo "⚠️  Found $LOVABLE_COUNT potential Lovable references"
    grep -r "lovable\|Lovable" src/ 2>/dev/null | grep -v node_modules
fi
echo ""

# Step 4: Build test
echo "🔨 Step 4: Testing build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors above"
    exit 1
fi
echo ""

# Step 5: Summary
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Prepare for Vercel' && git push"
echo "2. Open: https://vercel.com"
echo "3. Import your GitHub repository"
echo "4. Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo "📋 Quick checklist: DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🎮 Good luck with your deployment!"