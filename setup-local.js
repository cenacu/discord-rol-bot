const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando entorno local...');

// Verificar si existe el archivo .env
if (!fs.existsSync('.env')) {
  console.log('📝 Creando archivo .env de ejemplo...');
  const envExample = `# Discord Bot
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=your_client_id_here

# DynamoDB Local
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000
`;
  fs.writeFileSync('.env', envExample);
  console.log('✅ Archivo .env creado. Por favor, actualiza los valores con tus credenciales.');
}

// Verificar dependencias
try {
  console.log('🔍 Verificando dependencias...');
  execSync('node -v');
  console.log('✅ Node.js está instalado');
  
  execSync('java -version');
  console.log('✅ Java está instalado');
  
  console.log('📦 Instalando dependencias del proyecto...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas correctamente');
  
  console.log(`
🎉 Configuración completada!

Para iniciar el proyecto:
1. Actualiza las credenciales en el archivo .env
2. Inicia DynamoDB Local
3. En una nueva terminal ejecuta: npm run dev

Para más información, consulta el README.md
`);
} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  console.log(`
Por favor, asegúrate de tener instalado:
1. Node.js (https://nodejs.org)
2. Java Runtime Environment (JRE)
`);
}
