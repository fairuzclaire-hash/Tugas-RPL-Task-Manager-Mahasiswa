@echo off
title Build EXE

echo build task manager jadi exe...
echo.

pip show pyinstaller >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pyinstaller blm ada, install dulu...
    pip install pyinstaller
    echo.
)

echo building...
echo tunggu bentar :3
echo.

pyinstaller --onefile --windowed --add-data "assets;assets" --add-data "index.html;." --name "TaskManager" main.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo selesai! file exe ada di folder dist
    echo.
) else (
    echo.
    echo gagal build, cek error diatas
    echo.
)

pause
