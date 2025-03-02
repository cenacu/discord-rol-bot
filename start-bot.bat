@echo off
echo === Bot de Discord para Comunidades de Rol ===
echo Iniciando configuracion...

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
        echo CLIENT_ID=your_client_id_here
        echo.
        echo # AWS DynamoDB
        echo AWS_ACCESS_KEY_ID=your_aws_access_key_id
        echo AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
        echo AWS_REGION=your_preferred_region
    ) > .env
    echo [!] Por favor, edita el archivo .env con tus credenciales antes de continuar
    notepad .env
    echo.
    echo Despues de guardar tus credenciales, presiona cualquier tecla para continuar...
    pause >nul
)

:: Instalar dependencias si no existen
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
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
