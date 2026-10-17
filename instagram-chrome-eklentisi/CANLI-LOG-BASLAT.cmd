@echo off
cd /d "%~dp0"
where pythonw >nul 2>nul
if errorlevel 1 (
  echo Python bulunamadi. Python 3 kurulduktan sonra yeniden calistir.
  pause
  exit /b 1
)
start "Instagram yerel gunluk" /b pythonw "%~dp0log-bridge.py"
echo Baslatma istendi. Canli gunluk ekranindan baglantiyi kontrol et. Kayit: ust klasordeki instagram-canli-log.jsonl
timeout /t 3 >nul
