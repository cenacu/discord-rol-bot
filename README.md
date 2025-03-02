# Bot de Discord para Comunidades de Rol

## Requisitos del Sistema
- Node.js v20 o superior
- npm (viene con Node.js)
- Git

## Configuración Local

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

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
npm run dev
```

La aplicación estará disponible en:
- Servidor Express: http://localhost:5000

## Configuración del Bot de Discord

1. Crea una nueva aplicación en el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)
2. Crea un bot para tu aplicación
3. Copia el token del bot y agrégalo a tu archivo `.env`
4. Utiliza el link de invitación generado para agregar el bot a tu servidor

## Comandos Disponibles
- `/character` - Gestión de personajes
- `/currency` - Sistema de economía
- `/money` - Gestión de dinero
- `/admin` - Comandos administrativos
- `/backup` - Sistema de respaldos

## Solución de Problemas

### Error con las Credenciales de AWS
Asegúrate de que:
1. Las credenciales de AWS sean válidas
2. El usuario de AWS tenga los permisos necesarios para DynamoDB
3. La región de AWS esté correctamente configurada

### Error con el Bot de Discord
Verifica que:
1. El token del bot sea válido
2. El bot tenga los permisos necesarios en el servidor
3. Los comandos estén registrados correctamente

Para más ayuda, consulta los logs del servidor o abre un issue en el repositorio.