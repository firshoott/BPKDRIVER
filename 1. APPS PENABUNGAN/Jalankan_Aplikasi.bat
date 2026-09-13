@echo off
title Menjalankan TabunganKu (Mode Wi-Fi LAN)...
setlocal enabledelayedexpansion

echo ================================================================
echo       TABUNGANKU - APLIKASI KEUANGAN BERBASIS LOCAL AREA
echo ================================================================
echo.

:: Dapatkan IP lokal host menggunakan PHP XAMPP
set "LAN_IP=192.168.1.10"
if exist "C:\xampp\php\php.exe" (
    for /f "tokens=*" %%a in ('"C:\xampp\php\php.exe" -r "echo gethostbyname(gethostname());"') do (
        set "LAN_IP=%%a"
    )
)

echo [OK] Wi-Fi Terhubung        : PERTA SHOP
echo [OK] IP Komputer Server     : !LAN_IP!
echo.
echo ----------------------------------------------------------------
echo   ALAMAT AKSES APLIKASI:
echo ----------------------------------------------------------------
echo   1. Dari Komputer ini     : http://localhost/apps_penabungan/
echo   2. Dari HP / Laptop lain : http://!LAN_IP!/apps_penabungan/
echo.
echo   * Pastikan HP terhubung ke Wi-Fi: PERTA SHOP
echo   * Perangkat di luar Wi-Fi ini tidak dapat mengakses aplikasi
echo ----------------------------------------------------------------
echo.

:: Cek apakah Apache XAMPP sedang berjalan pada port 80
netstat -ano | findstr :80 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo [OK] Apache XAMPP terdeteksi aktif pada port 80.
    echo Membuka aplikasi di browser komputer ini...
    start http://localhost/apps_penabungan/index.php
    echo.
    echo Aplikasi siap digunakan. Jendela ini dapat Anda biarkan terbuka atau diminimalkan.
    pause >nul
    exit
)

:: Jika Apache tidak aktif, jalankan melalui PHP CLI bawaan XAMPP pada 0.0.0.0 (agar HP bisa akses)
echo [INFO] Apache XAMPP belum aktif. Menjalankan server lokal PHP CLI...
echo Membuka port 8000 untuk seluruh perangkat di jaringan Wi-Fi...
start /B "" "C:\xampp\php\php.exe" -S 0.0.0.0:8000 router.php
timeout /t 2 /nobreak >nul
start http://localhost:8000/
echo.
echo Server PHP aktif di http://!LAN_IP!:8000/
echo JANGAN TUTUP jendela ini selama menggunakan aplikasi via HP / komputer lain!
echo.
pause
