@echo off
title Live Translator
cd /d "%~dp0"
set URL=http://localhost:5177
set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe
start "" "%CHROME%" --app=%URL%
node server.cjs
