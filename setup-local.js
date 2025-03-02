import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando entorno local...');

// Verificar si existe el archivo .env
if (!fs.existsSync('.env')) {
  console.log('📝 Creando archivo .env de ejemplo...');
  const envExample = `# Discord Bot
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=1342885981291942020
PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740

# AWS DynamoDB
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_preferred_region
`;
  fs.writeFileSync('.env', envExample);
  console.log('✅ Archivo .env creado. Por favor, actualiza el DISCORD_TOKEN con tu token del bot.');
}

// Verificar dependencias
try {
  console.log('🔍 Verificando dependencias...');
  execSync('node -v');
  console.log('✅ Node.js está instalado');

  console.log('📦 Instalando dependencias del proyecto...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas correctamente');

  console.log(`
🎉 Configuración completada!

Para iniciar el proyecto:
1. Actualiza el DISCORD_TOKEN en el archivo .env:
   - Ve a https://discord.com/developers/applications/1342885981291942020/bot
   - En la sección "Bot", copia el token y agrégalo como DISCORD_TOKEN

2. Ejecuta: npm run dev

Para más información, consulta el README.md
`);
} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  console.log(`
Por favor, asegúrate de tener instalado:
1. Node.js versión 20 o superior
2. npm (viene con Node.js)
`);
}