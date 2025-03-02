#!/bin/bash
echo "🚀 Configurando el Bot de Discord en EC2..."

# Instalar Node.js
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
echo "✅ Node.js instalado:"
node --version
npm --version

# Instalar pm2 para mantener el bot ejecutándose
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOL
# Discord Bot
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=1342885981291942020
PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740

# AWS DynamoDB
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_preferred_region
EOL
    echo "✅ Archivo .env creado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear script de inicio
cat > start.sh << EOL
#!/bin/bash
pm2 start npm --name "discord-bot" -- run dev
EOL
chmod +x start.sh

echo """
🎉 Configuración completada!

Para configurar el bot:
1. Edita el archivo .env:
   nano .env

2. Configura el bot para que inicie automáticamente:
   ./start.sh

3. Para ver los logs:
   pm2 logs discord-bot

4. Para verificar el estado:
   pm2 status

5. Para reiniciar el bot:
   pm2 restart discord-bot

6. Para detener el bot:
   pm2 stop discord-bot

7. Para que el bot inicie automáticamente al reiniciar el servidor:
   pm2 startup
   pm2 save
"""