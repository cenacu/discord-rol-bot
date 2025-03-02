@echo off
echo === Bot de Discord para Comunidades de Rol ===
echo Iniciando configuracion...

:: Obtener el directorio del script
cd /d "%~dp0"
echo Directorio actual: %CD%

:: Verificar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado!
    echo Por favor, instala Node.js desde https://nodejs.org
    echo Presiona cualquier tecla para abrir el sitio web...
    pause >nul
    start https://nodejs.org
    exit /b 1
)

:: Verificar si existe el archivo .env
if not exist .env (
    echo [ERROR] No se encuentra el archivo .env
    echo Por favor, ejecuta configure.bat primero para configurar las credenciales
    echo.
    echo Presiona cualquier tecla para ejecutar configure.bat...
    pause >nul
    call configure.bat
    exit /b 1
)

:: Verificar si existe package.json
if not exist package.json (
    echo [ERROR] No se encuentra el archivo package.json
    echo Asegurate de estar ejecutando este script desde el directorio del proyecto
    echo Directorio actual: %CD%
    pause
    exit /b 1
)

:: Instalar dependencias si no existen
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Error al instalar las dependencias
        echo Por favor, verifica tu conexion a internet y que Node.js este correctamente instalado
        pause
        exit /b 1
    )
)

:: Iniciar el bot
echo.
echo Iniciando el bot...
call npm run dev

:: Si hay un error, mantener la ventana abierta
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al iniciar el bot
    echo Revisa los mensajes de error anteriores
    pause
)