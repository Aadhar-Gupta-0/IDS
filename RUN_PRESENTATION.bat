@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Job-Change Radar Launcher

echo ============================================================
echo              JOB-CHANGE RADAR - PRESENTATION
echo ============================================================
echo.

REM Prefer the Windows Python launcher when available, then fall back to python.exe.
set "PY_CMD="
where py >nul 2>nul && set "PY_CMD=py"
if not defined PY_CMD (
  where python >nul 2>nul && set "PY_CMD=python"
)
if not defined PY_CMD (
  echo [ERROR] Python was not found.
  echo Install 64-bit Python 3.11, 3.12, 3.13 or 3.14 and retry.
  pause
  exit /b 1
)

REM Create venv if needed. If "py" is present, prefer 3.12 when installed; otherwise use default Python.
if not exist ".venv\Scripts\python.exe" (
  echo [1/4] Creating virtual environment...
  if /I "%PY_CMD%"=="py" (
    py -3.12 -c "import sys" >nul 2>nul
    if not errorlevel 1 (
      py -3.12 -m venv .venv
    ) else (
      py -m venv .venv
    )
  ) else (
    python -m venv .venv
  )
  if errorlevel 1 (
    echo [ERROR] Could not create the virtual environment.
    pause
    exit /b 1
  )
)

call ".venv\Scripts\activate.bat"

echo [2/4] Checking runtime dependencies...
python -c "import fastapi,uvicorn,catboost,pandas,numpy,pydantic" >nul 2>nul
if errorlevel 1 (
  echo Dependencies are not installed yet.
  echo First-time setup needs an internet connection to PyPI.
  echo.
  echo Checking DNS access to pypi.org...
  powershell -NoProfile -Command "try { [System.Net.Dns]::GetHostAddresses('pypi.org') ^| Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
  if errorlevel 1 (
    echo.
    echo [ERROR] Your PC cannot currently resolve pypi.org.
    echo This is a network/DNS issue, not a model issue.
    echo.
    echo Fix: connect to working internet or a phone hotspot, then run this file again.
    echo If Wi-Fi is already connected, try these commands in an Administrator terminal:
    echo     ipconfig /flushdns
    echo     netsh winsock reset
    echo Then restart Windows.
    echo.
    pause
    exit /b 1
  )

  echo [3/4] Installing compatible packages. This happens only on first setup...
  python -m pip install --upgrade pip setuptools wheel
  if errorlevel 1 goto :install_fail
  python -m pip install --only-binary=:all: -r requirements.txt
  if errorlevel 1 goto :install_fail
) else (
  echo Runtime dependencies already installed - skipping internet setup.
)

python -c "from catboost import CatBoostClassifier; import pandas,numpy; print('[OK] Python runtime ready')" || goto :install_fail

echo [4/4] Starting Job-Change Radar at http://127.0.0.1:8000
start "" http://127.0.0.1:8000
python -m uvicorn server:app --host 127.0.0.1 --port 8000
exit /b 0

:install_fail
echo.
echo [ERROR] Dependency installation failed.
echo If you previously had a failed setup, close this window and run RESET_ENV.bat once,
echo then run RUN_PRESENTATION.bat again while connected to the internet.
echo.
pause
exit /b 1
