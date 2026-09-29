@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Run RUN_PRESENTATION.bat once first so the environment is created.
  pause
  exit /b 1
)
call ".venv\Scripts\activate.bat"
python verify_project.py
pause
endlocal
