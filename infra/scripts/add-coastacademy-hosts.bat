@echo off
setlocal
set "SCRIPT=%~dp0add-coastacademy-hosts.ps1"
echo Solicitando permissao de Administrador (UAC)...
powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','\"%SCRIPT%\"'"
if errorlevel 1 goto fail

ping -n 1 coastacademy >nul 2>&1
if errorlevel 1 goto fail

echo.
echo OK. Abra no navegador: http://coastacademy/login
pause
exit /b 0

:fail
echo.
echo Nao foi possivel configurar coastacademy.
echo 1) Clique com botao direito neste arquivo -^> Executar como administrador
echo 2) Ou use http://localhost/login (ja funciona sem hosts)
pause
exit /b 1
