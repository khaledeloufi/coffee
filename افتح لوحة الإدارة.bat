@echo off
title Maladh Admin Panel
cd /d "%~dp0"
tasklist /fi "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if errorlevel 1 (
    echo Starting server...
    start "MaladhServer" "C:\Program Files\nodejs\node.exe" server.js
    timeout /t 2 /nobreak >nul
)
start "" "http://localhost:3000/admin.html"