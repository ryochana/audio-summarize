@echo off
echo ====================================
echo    Audio Summarizer - Manual Deploy
echo ====================================

echo.
echo [Step 1] Installing Vercel CLI...
npm install -g vercel
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo.
echo [Step 2] Building project...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [Step 3] Login to Vercel...
echo Please follow the browser instructions to login
vercel login

echo.
echo [Step 4] Deploying to production...
echo Setting up environment variables...
vercel env add VITE_GOOGLE_AI_API_KEY production

echo.
echo Deploying...
vercel --prod

echo.
echo ================================
echo    DEPLOYMENT COMPLETED!
echo ================================
echo.
echo Your app is now live!
echo Check the URL shown above.
echo.
pause
