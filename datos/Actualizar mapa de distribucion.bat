@echo off
rem Lee distribucion.xlsx y actualiza distribucion.js (los datos del mapa de distribucion).
rem Antes de ejecutarlo, guarda el Excel.
title Actualizar mapa de distribucion
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\herramientas\excel-a-datos.ps1" -Excel "%~dp0distribucion.xlsx" -Datos "%~dp0distribucion.js"
echo.
pause
