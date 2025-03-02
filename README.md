# Bot de Discord para Comunidades de Rol

## Inicio Rápido (Windows)
1. Instala [Node.js](https://nodejs.org) si no lo tienes instalado
2. Descarga este repositorio
3. **IMPORTANTE**: Extrae todos los archivos a una carpeta (por ejemplo: `C:\MiBot`)
4. Navega a la carpeta donde extrajiste los archivos
5. Haz doble clic en `start-bot.bat`
6. Sigue las instrucciones en pantalla para configurar el token del bot:
   - El script abrirá automáticamente la página del bot en el Portal de Desarrolladores
   - En la sección "Bot", copia el token
   - Pega el token en el archivo .env cuando se abra

**Nota**: No ejecutes start-bot.bat desde el explorador de Windows sin estar en la carpeta del proyecto.

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

### Error con las Credenciales
Verifica que:
1. El DISCORD_TOKEN sea válido (copiado correctamente de la sección Bot)
2. Las credenciales de AWS sean correctas
3. La región de AWS esté bien configurada

### El Bot No Responde
Asegúrate de que:
1. El bot esté invitado a tu servidor
2. Tenga los permisos necesarios
3. Los comandos estén registrados

Para más ayuda, revisa los logs o abre un issue en el repositorio.