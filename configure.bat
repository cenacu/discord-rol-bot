@echo off
echo === Configuracion del Bot de Discord ===
echo.

cd /d "%~dp0"

echo Configurando credenciales...
echo.

:ask_discord
echo === TOKEN DE DISCORD ===
echo 1. Ve a: https://discord.com/developers/applications/1342885981291942020/bot
echo 2. En la seccion "Bot", copia el token
set /p DISCORD_TOKEN="Ingresa el token del bot de Discord: "
echo.

:ask_aws_region
echo === REGION DE AWS ===
echo Regiones disponibles:
echo 1) us-east-1 (Virginia)
echo 2) us-west-2 (Oregon)
echo 3) eu-west-1 (Irlanda)
echo 4) sa-east-1 (Sao Paulo)
set /p AWS_REGION_CHOICE="Elige el numero de tu region (1-4): "
if "%AWS_REGION_CHOICE%"=="1" set AWS_REGION=us-east-1
if "%AWS_REGION_CHOICE%"=="2" set AWS_REGION=us-west-2
if "%AWS_REGION_CHOICE%"=="3" set AWS_REGION=eu-west-1
if "%AWS_REGION_CHOICE%"=="4" set AWS_REGION=sa-east-1
echo.

:ask_aws_keys
echo === CREDENCIALES DE AWS ===
echo Para obtener tus credenciales de AWS:
echo 1. Inicia sesion en la Consola de AWS
echo 2. Ve a IAM - Security Credentials
echo 3. Crea o usa una Access Key existente
set /p AWS_ACCESS_KEY_ID="Ingresa tu AWS Access Key ID: "
set /p AWS_SECRET_ACCESS_KEY="Ingresa tu AWS Secret Access Key: "
echo.

echo Guardando configuracion...
(
echo # Discord Bot
echo DISCORD_TOKEN=%DISCORD_TOKEN%
echo CLIENT_ID=1342885981291942020
echo PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740
echo.
echo # AWS DynamoDB
echo AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID%
echo AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY%
echo AWS_REGION=%AWS_REGION%
) > .env

echo ✅ Configuracion guardada exitosamente!
echo.
echo Para iniciar el bot:
echo 1. Ejecuta start-bot.bat
echo.
pause
