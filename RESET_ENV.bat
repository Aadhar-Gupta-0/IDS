@echo off
setlocal
cd /d "%~dp0"
echo This will remove ONLY the local .venv environment and rebuild it on the next launch.
if exist ".venv" (
  rmdir /s /q ".venv"
  echo Removed .venv successfully.
) else (
  echo No .venv folder exists yet.
)
echo Now connect to the internet and run RUN_PRESENTATION.bat again.
pause
endlocal
