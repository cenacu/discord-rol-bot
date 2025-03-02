# Bot de Discord para Comunidades de Rol

## Inicio Rápido (Windows)
1. Instala [Node.js](https://nodejs.org) si no lo tienes instalado
2. Descarga este repositorio
3. Haz doble clic en `start-bot.bat`
4. Sigue las instrucciones en pantalla

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
DISCORD_TOKEN=tu_token_de_discord
CLIENT_ID=id_de_tu_aplicacion_discord

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

### Error con las Credenciales
Verifica que:
1. Las credenciales de Discord (DISCORD_TOKEN y CLIENT_ID) sean válidas
2. Las credenciales de AWS sean correctas
3. La región de AWS esté bien configurada

### El Bot No Responde
Asegúrate de que:
1. El bot esté invitado a tu servidor
2. Tenga los permisos necesarios
3. Los comandos estén registrados

Para más ayuda, revisa los logs o abre un issue en el repositorio.