@echo off
setlocal EnableExtensions

REM ============================================================================
REM  iniciar_mobile.bat - Prepara SaludWEB para un celular en la misma WiFi
REM ============================================================================
REM  Que hace:
REM    1) detecta la IP local de la PC (WiFi o cable);
REM    2) actualiza SaludWEB_Mobile\.env con esa IP;
REM    3) levanta la API en 0.0.0.0:8000 para que el celular la alcance;
REM    4) abre Expo en modo LAN para escanear el QR con Expo Go.
REM
REM  Sirve para cualquier celular Android o iPhone, sin importar la marca
REM  (Redmi, Motorola, Samsung, etc.).
REM
REM  Requisitos:
REM    - SaludWEB_Backend como carpeta hermana de SaludWEB_Mobile;
REM    - PHP (propio o en el PATH);
REM    - npm install hecho en SaludWEB_Mobile;
REM    - PC y celular (Android o iPhone) en la misma red WiFi.
REM
REM  Si el celular no conecta, ejecutar como administrador:
REM    scripts\permitir_firewall_saludweb.bat
REM ============================================================================

REM --- 1) Rutas base ----------------------------------------------------------
for %%I in ("%~dp0..") do set "MOBILE_DIR=%%~fI"
for %%I in ("%~dp0..\..\SaludWEB_Backend") do set "BACKEND_DIR=%%~fI"

REM --- 2) Elegir PHP ----------------------------------------------------------
set "PHP=%SALUDWEB_PHP%"
if not defined PHP if exist "C:\Users\AILEN\php83\php.exe" set "PHP=C:\Users\AILEN\php83\php.exe"
if not defined PHP set "PHP=php"

"%PHP%" -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro PHP.
  echo         Instalalo o defini la variable SALUDWEB_PHP.
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\index.php" (
  echo [ERROR] No encuentro el backend en: "%BACKEND_DIR%"
  echo         Clona SaludWEB_Backend como carpeta hermana de SaludWEB_Mobile.
  pause
  exit /b 1
)

REM --- 3) Detectar la IP local (WiFi o cable) --------------------------------
set "LAN_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|VirtualBox|VMware|Bluetooth|Tailscale|ZeroTier|Hamachi' } | Sort-Object { if ($_.InterfaceAlias -like '*Wi-Fi*') { 0 } elseif ($_.InterfaceAlias -like '*Ethernet*') { 1 } else { 2 } } | Select-Object -First 1 -ExpandProperty IPAddress; $ip"`) do set "LAN_IP=%%I"

if not defined LAN_IP (
  echo [ERROR] No se pudo detectar la IP local de la PC.
  echo         Verifica que la PC este conectada a la red, por WiFi o cable.
  pause
  exit /b 1
)

echo IP local detectada: %LAN_IP%

REM --- 4) Actualizar .env con la IP actual ------------------------------------
if not exist "%MOBILE_DIR%\.env" copy /Y "%MOBILE_DIR%\.env.example" "%MOBILE_DIR%\.env" >nul

REM Si la IP no cambio, no hace falta borrar la cache de Metro en cada arranque.
set "NEED_CLEAR=--clear"
findstr /C:"EXPO_PUBLIC_API_URL=http://%LAN_IP%:8000/api" "%MOBILE_DIR%\.env" >nul 2>&1
if not errorlevel 1 set "NEED_CLEAR="

powershell -NoProfile -Command "$p = '%MOBILE_DIR%\.env'; $line = 'EXPO_PUBLIC_API_URL=http://%LAN_IP%:8000/api'; $text = Get-Content -LiteralPath $p -Raw; if ($text -match '(?m)^EXPO_PUBLIC_API_URL=.*$') { $text = $text -replace '(?m)^EXPO_PUBLIC_API_URL=.*$', $line } else { $text = $text.TrimEnd() + [Environment]::NewLine + $line + [Environment]::NewLine }; [System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding($false)))"

echo API configurada en: http://%LAN_IP%:8000/api

REM --- 5) Comprobar si la API ya esta arriba --------------------------------
set "API_BIND="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { $c.LocalAddress }"`) do set "API_BIND=%%I"

if defined API_BIND (
  echo La API ya estaba escuchando en %API_BIND%:8000
  if "%API_BIND%"=="127.0.0.1" (
    echo [ERROR] La API esta escuchando solo para la PC.
    echo         Cierra la ventana "SaludWEB API" y volve a ejecutar este script.
    pause
    exit /b 1
  )
  if "%API_BIND%"=="::1" (
    echo [ERROR] La API esta escuchando solo para la PC.
    echo         Cierra la ventana "SaludWEB API" y volve a ejecutar este script.
    pause
    exit /b 1
  )
) else (
  echo Levantando la API en 0.0.0.0:8000 ...
  start "SaludWEB API (celular)" /D "%BACKEND_DIR%" "%PHP%" -S 0.0.0.0:8000 index.php
)

REM --- 6) Esperar a que la API responda --------------------------------------
for /L %%i in (1,1,30) do (
  curl.exe -s -f -o NUL "http://127.0.0.1:8000/api/health"
  if not errorlevel 1 goto api_lista
  ping -n 2 127.0.0.1 >nul
)

echo [ERROR] La API no respondio en 30 segundos.
pause
exit /b 1

:api_lista
echo API lista en http://%LAN_IP%:8000/api

REM --- 7) Avisar si falta la regla de firewall ------------------------------
netsh advfirewall firewall show rule name="SaludWEB API 8000" >nul 2>&1
if errorlevel 1 (
  echo [AVISO] Windows Firewall no tiene la regla para el puerto 8000.
  echo         Ejecuta como administrador:
  echo         scripts\permitir_firewall_saludweb.bat
)

REM --- 8) Abrir Expo en modo LAN ---------------------------------------------
set "METRO_BIND="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($c) { $c.LocalAddress }"`) do set "METRO_BIND=%%I"

if defined METRO_BIND goto expo_ya

echo Abriendo Expo...
if defined NEED_CLEAR goto expo_clear
start "SaludWEB Mobile" /D "%MOBILE_DIR%" cmd /k "npx expo start --lan"
goto expo_listo

:expo_clear
start "SaludWEB Mobile" /D "%MOBILE_DIR%" cmd /k "npx expo start --lan --clear"
goto expo_listo

:expo_ya
echo Expo ya estaba corriendo en el puerto 8081.
echo Usa la ventana "SaludWEB Mobile" que ya esta abierta.

:expo_listo

echo.
echo ============================================================================
echo  En cualquier celular (Android o iPhone):
echo    1. Android: instala Expo Go desde Play Store.
echo       Si no acepta SDK 53, desinstalalo e instala Expo Go 2.33.22:
echo       https://github.com/expo/expo-go-releases/releases/download/Expo-Go-2.33.22/Expo-Go-2.33.22.apk
echo    2. iPhone: instala Expo Go desde App Store.
echo       Si dice que el SDK 53 no es compatible, usa un development build
echo       con EAS o actualiza el SDK del proyecto.
echo    3. Conecta el celular a la MISMA WiFi que la PC.
echo       En Xiaomi/Redmi apaga datos moviles, VPN y "Asistente de Wi-Fi".
echo    4. Prueba en el navegador del celular: http://%LAN_IP%:8000/api/health
echo    5. Escanea el QR de la ventana "SaludWEB Mobile".
echo    6. Si no conecta, ejecuta el script de firewall como administrador.
echo ============================================================================
ping -n 9 127.0.0.1 >nul
exit /b 0
