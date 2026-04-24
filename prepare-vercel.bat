@echo off
REM GrammarQuest Pre-Deployment Setup Script for Windows
REM This script prepares your app for Vercel deployment

echo.
echo 🚀 GrammarQuest - Vercel Deployment Setup
echo ==========================================
echo.

REM Step 1: Clean up dependencies
echo 📦 Step 1: Cleaning up dependencies...
rmdir /s /q node_modules 2>nul
call npm install
echo ✅ Dependencies updated
echo.

REM Step 2: Remove unused lovable folder (optional)
echo 🧹 Step 2: Removing unused Lovable folder...
if exist "src\integrations\lovable" (
    rmdir /s /q "src\integrations\lovable"
    echo ✅ Lovable folder removed
) else (
    echo ⏭️  Lovable folder not found (already removed)
)
echo.

REM Step 3: Build test
echo 🔨 Step 3: Testing build...
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed - fix errors above
    pause
    exit /b 1
)
echo.

REM Step 4: Summary
echo ==========================================
echo ✨ Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Push to GitHub: git add . ^& git commit -m "Prepare for Vercel" ^& git push
echo 2. Open: https://vercel.com
echo 3. Import your GitHub repository
echo 4. Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)
echo 5. Deploy!
echo.
echo 📖 For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md
echo 📋 Quick checklist: DEPLOYMENT_CHECKLIST.md
echo.
echo 🎮 Good luck with your deployment!
echo.
pause