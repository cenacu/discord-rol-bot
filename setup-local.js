
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando entorno local...');

// Verificar si existe el archivo .env
if (!fs.existsSync('.env')) {
  console.log('📝 Creando archivo .env de ejemplo...');
  const envExample = `# Discord Bot
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=your_client_id_here

# AWS DynamoDB
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_preferred_region
`;
  fs.writeFileSync('.env', envExample);
  console.log('✅ Archivo .env creado. Por favor, actualiza los valores con tus credenciales.');
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
1. Actualiza las credenciales en el archivo .env:
   - Configura tu DISCORD_TOKEN y CLIENT_ID desde el Portal de Desarrolladores de Discord
   - Configura tus credenciales de AWS (AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY)
   - Establece tu región preferida de AWS (AWS_REGION)

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
