# Bot de Discord para Comunidades de Rol

## Inicio Rápido (Windows)
1. Instala [Node.js](https://nodejs.org) si no lo tienes instalado
2. Descarga este repositorio
3. **IMPORTANTE**: Extrae todos los archivos a una carpeta (por ejemplo: `C:\MiBot`)
4. Navega a la carpeta donde extrajiste los archivos
5. Ejecuta `configure.bat` y sigue las instrucciones para configurar las credenciales
6. Ejecuta `start-bot.bat` para iniciar el bot

## Credenciales Necesarias
1. **Token de Discord**:
   - Ve a https://discord.com/developers/applications/1342885981291942020/bot
   - En la sección "Bot", copia el token

2. **Credenciales de AWS**:
   - Necesitarás una cuenta de AWS
   - Access Key ID y Secret Access Key de AWS
   - Región de AWS donde se ejecutará el servicio

## Configuración Manual
Si prefieres configurar manualmente:

### 1. Requisitos del Sistema
- Node.js v20 o superior
- npm (viene con Node.js)
- Git

### 2. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
# Discord Bot
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=1342885981291942020
PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740

# AWS DynamoDB
AWS_ACCESS_KEY_ID=tu_aws_access_key_id
AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key
AWS_REGION=tu_region_preferida
```

### 4. Iniciar la Aplicación
```bash
npm install
npm run dev
```

## Comandos Disponibles
- `/character` - Gestión de personajes
- `/currency` - Sistema de economía
- `/money` - Gestión de dinero
- `/admin` - Comandos administrativos
- `/backup` - Sistema de respaldos

## Solución de Problemas

### El Bot No Responde
Asegúrate de que:
1. El bot esté invitado a tu servidor
2. Las credenciales en el archivo .env sean correctas
3. El bot tenga los permisos necesarios

Para más ayuda, revisa los logs o abre un issue en el repositorio.