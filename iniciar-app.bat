@echo off
title GuaraniApp - Iniciar Servidor y Cliente (Expo SDK 57)
set "PATH=C:\laragon\bin\nodejs\node-v22\PFiles64\nodejs;C:\laragon\bin\git\cmd;%PATH%"

echo ====================================================
echo   🦊 GuaraniApp - Guaraní Oriental Boliviano
echo   🚀 Entorno: Node v22 + Expo SDK 57 (Compatible Expo Go)
echo ====================================================
echo.
echo 1. Iniciando Servidor Backend (Node.js + Express)...
start "GuaraniApp Backend" cmd /k "set PATH=C:\laragon\bin\nodejs\node-v22\PFiles64\nodejs;C:\laragon\bin\git\cmd;%%PATH%% && cd server && npm start"

echo.
echo 2. Iniciando Cliente Movil y Web (Expo SDK 57)...
cd client
npx expo start
pause
