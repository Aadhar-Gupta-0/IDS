@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   IDS FINAL PROJECT -> GITHUB PUSH
echo ============================================================
echo.
echo Target repository:
echo   https://github.com/Aadhar-Gupta-0/IDS.git
echo.
echo NOTE:
echo - The previous main branch has already been backed up remotely as:
echo   backup-before-final-presentation
echo - This script REPLACES the contents of main with this folder.
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed or not available in PATH.
  echo Install Git for Windows from https://git-scm.com/download/win
  echo Then reopen this folder and run this script again.
  pause
  exit /b 1
)

git --version
echo.

if not exist ".git" (
  echo [1/7] Initializing Git repository...
  git init
  if errorlevel 1 goto :fail
) else (
  echo [1/7] Existing Git repository found.
)

echo [2/7] Setting branch to main...
git branch -M main
if errorlevel 1 goto :fail

echo [3/7] Configuring remote...
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin https://github.com/Aadhar-Gupta-0/IDS.git
) else (
  git remote set-url origin https://github.com/Aadhar-Gupta-0/IDS.git
)
if errorlevel 1 goto :fail

echo [4/7] Adding project files...
git add -A
if errorlevel 1 goto :fail

echo [5/7] Creating final project commit...
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Replace IDS with final Job Change Radar presentation and deployment"
  if errorlevel 1 (
    echo.
    echo Git may need your identity configured.
    echo If asked, run:
    echo   git config --global user.name "YOUR NAME"
    echo   git config --global user.email "YOUR GITHUB EMAIL"
    echo Then run this script again.
    goto :fail
  )
) else (
  echo No new staged changes to commit.
)

echo [6/7] Pushing final project to GitHub...
echo.
echo GitHub may open a browser window for authentication.
echo Complete the login if prompted.
echo.
git push -u origin main --force
if errorlevel 1 goto :fail

echo.
echo [7/7] SUCCESS
echo ============================================================
echo GitHub main now contains this project folder.
echo Repository:
echo https://github.com/Aadhar-Gupta-0/IDS
echo.
echo Old repository contents remain safely available in:
echo backup-before-final-presentation
echo ============================================================
pause
exit /b 0

:fail
echo.
echo ============================================================
echo PUSH FAILED.
echo Copy the error shown above and send it to ChatGPT.
echo No project files on your computer were deleted.
echo ============================================================
pause
exit /b 1
