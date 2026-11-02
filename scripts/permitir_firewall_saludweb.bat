@echo off
setlocal EnableExtensions

REM ============================================================================
REM  permitir_firewall_saludweb.bat - Habilita la API y Expo en la red local
REM ============================================================================
REM  Abre solo los puertos necesarios y solo para la subred local.
REM  Sirve para cualquier celular (Android o iPhone, cualquier marca):
REM    - 8000/TCP: API PHP de SaludWEB.
REM    - 8081/TCP: servidor Metro de Expo.
REM    - 5173/TCP: version web de SaludWEB en el navegador del celular.
REM
REM  El script se eleva solo: Windows va a pedir permiso de administrador.
REM  No abre los puertos a Internet: remoteip=localsubnet limita el acceso
REM  a equipos de la misma red.
REM ============================================================================

net session >nul 2>&1
if errorlevel 1 (
  echo Solicitando permisos de administrador...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 0
)

echo Creando reglas de firewall para la red local...

netsh advfirewall firewall delete rule name="SaludWEB API 8000" >nul 2>&1
netsh advfirewall firewall add rule name="SaludWEB API 8000" dir=in action=allow protocol=TCP localport=8000 remoteip=localsubnet profile=private,public

netsh advfirewall firewall delete rule name="SaludWEB Expo 8081" >nul 2>&1
netsh advfirewall firewall add rule name="SaludWEB Expo 8081" dir=in action=allow protocol=TCP localport=8081 remoteip=localsubnet profile=private,public

netsh advfirewall firewall delete rule name="SaludWEB Web 5173" >nul 2>&1
netsh advfirewall firewall add rule name="SaludWEB Web 5173" dir=in action=allow protocol=TCP localport=5173 remoteip=localsubnet profile=private,public

echo.
echo Listo. Reglas creadas:
echo   - SaludWEB API 8000 (TCP 8000, solo subred local)
echo   - SaludWEB Expo 8081 (TCP 8081, solo subred local)
echo   - SaludWEB Web 5173 (TCP 5173, solo subred local)
echo.
echo Para quitarlas mas adelante:
echo   netsh advfirewall firewall delete rule name="SaludWEB API 8000"
echo   netsh advfirewall firewall delete rule name="SaludWEB Expo 8081"
echo   netsh advfirewall firewall delete rule name="SaludWEB Web 5173"
echo.
pause
