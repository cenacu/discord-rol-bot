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
    echo Creando archivo .env...
    (
        echo # Discord Bot
        echo DISCORD_TOKEN=your_discord_token_here
        echo CLIENT_ID=1342885981291942020
        echo PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740
        echo.
        echo # AWS DynamoDB
        echo AWS_ACCESS_KEY_ID=your_aws_access_key_id
        echo AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
        echo AWS_REGION=your_preferred_region
    ) > .env
    echo [!] Por favor, actualiza el DISCORD_TOKEN en el archivo .env
    echo Ubicacion del archivo: %CD%\.env
    echo.
    echo === INSTRUCCIONES PARA OBTENER EL TOKEN ===
    echo 1. Ve a https://discord.com/developers/applications/1342885981291942020/bot
    echo 2. En la seccion "Bot", copia el token
    echo.
    echo Las demas credenciales ya estan configuradas correctamente
    echo.
    start https://discord.com/developers/applications/1342885981291942020/bot
    notepad .env
    echo.
    echo Despues de guardar el token, presiona cualquier tecla para continuar...
    pause >nul
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