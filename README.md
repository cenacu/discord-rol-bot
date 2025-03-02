# Bot de Discord para Comunidades de Rol

## Despliegue en AWS EC2
1. Lanza una instancia EC2 (Ubuntu Server recomendado)
   - Usa Ubuntu Server 22.04 LTS
   - Tipo de instancia recomendada: t2.micro (capa gratuita)
   - Configura un grupo de seguridad que permita SSH (puerto 22)

2. Conecta a tu instancia:
   ```bash
   ssh -i tu-key.pem ubuntu@tu-ip-ec2
   ```

3. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_DIRECTORIO>
   ```

4. Ejecuta el script de configuración:
   ```bash
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

5. Configura las credenciales:
   ```bash
   nano .env
   ```

6. Inicia el bot:
   ```bash
   ./start.sh
   ```

### Gestión del Bot en EC2
- Ver logs: `pm2 logs discord-bot`
- Estado del bot: `pm2 status`
- Reiniciar bot: `pm2 restart discord-bot`
- Detener bot: `pm2 stop discord-bot`
- Configurar inicio automático: 
  ```bash
  pm2 startup
  pm2 save
  ```

## Credenciales Necesarias
1. **Token de Discord**:
   - Ve a https://discord.com/developers/applications/1342885981291942020/bot
   - En la sección "Bot", copia el token

2. **Credenciales de AWS**:
   - Necesitarás una cuenta de AWS
   - Access Key ID y Secret Access Key de AWS
   - Región de AWS donde se ejecutará el servicio

## Solución de Problemas

### El Bot No Responde
Asegúrate de que:
1. El bot esté invitado a tu servidor
2. Las credenciales en el archivo .env sean correctas
3. El bot tenga los permisos necesarios

Para ver los logs:
```bash
pm2 logs discord-bot
```

Para más ayuda, revisa los logs o abre un issue en el repositorio.