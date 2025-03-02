# Bot de Discord para Comunidades de Rol

## Guía Paso a Paso: Crear y Configurar Instancia EC2

### Comenzando
1. **Inicia sesión en AWS Console**
   - Ve a [AWS Console](https://aws.amazon.com/console/)
   - Haz clic en "Sign In to the Console"
   - Ingresa tus credenciales de AWS

2. **Navega a EC2**
   - En la barra de búsqueda superior, escribe "EC2"
   - Selecciona "EC2" de los resultados
   - **IMPORTANTE**: En la esquina superior derecha, selecciona "US East (Ohio) us-east-2"
   - Haz clic en "Launch Instance" (botón naranja)

### Requisitos Previos
1. Cuenta de AWS
   - Si no tienes una cuenta, créala en [AWS](https://aws.amazon.com)
   - Se requiere tarjeta de crédito para la verificación
   - La capa gratuita incluye 750 horas/mes de instancia t2.micro

2. Credenciales Discord Bot
   - Token del bot
   - Application ID: 1342885981291942020
   - Public Key: fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740

### Consideraciones de Seguridad
1. Guarda el archivo .pem en un lugar seguro
2. Nunca compartas tus credenciales de AWS
3. Configura facturación y alertas en AWS
4. Usa contraseñas fuertes para tu cuenta AWS

### Costos y Facturación
1. **Capa Gratuita de AWS**
   - 750 horas/mes de instancia t2.micro (suficiente para ejecutar 24/7)
   - 30GB de almacenamiento EBS
   - 1 GB de transferencia de datos saliente

2. **Configurar Alertas de Facturación**
   - Ve a AWS Billing Dashboard
   - Configura alertas para montos específicos
   - Monitorea el uso de recursos regularmente

3. **Evitar Cargos Inesperados**
   - Usa solo instancias t2.micro
   - No crees recursos adicionales sin necesidad
   - Revisa y elimina recursos no utilizados

### Gestión de Recursos AWS
1. **Monitoreo de Recursos**
   - Usa AWS CloudWatch para monitorear uso de CPU
   - Configura métricas personalizadas si es necesario
   - Revisa los logs de la instancia regularmente

2. **Respaldos y Mantenimiento**
   - Crea snapshots periódicos del volumen EBS
   - Mantén el sistema operativo actualizado
   - Monitorea el espacio en disco disponible

3. **Buenas Prácticas**
   - No dejes puertos innecesarios abiertos
   - Actualiza regularmente las credenciales
   - Mantén un registro de las modificaciones realizadas

### 2. Crear Nueva Instancia
1. Haz clic en "Launch Instance" (Lanzar instancia)
2. En "Name" escribe un nombre para tu instancia (ejemplo: "discord-bot")
3. En "Application and OS Images":
   - Selecciona "Ubuntu"
   - Elige "Ubuntu Server 22.04 LTS (64-bit)"
![Selección de Ubuntu](attached_assets/ubuntu-selection.png)

### 3. Configurar Instancia
1. En "Instance type":
   - Selecciona "t2.micro" (capa gratuita)
   - Esta instancia es suficiente para ejecutar el bot
![Tipo de Instancia](attached_assets/instance-type.png)
2. En "Key pair":
   - Clic en "Create new key pair"
   - Nombre: "discord-bot-key"
   - Tipo: RSA
   - Formato: .pem
   - ⚠️ IMPORTANTE: Guarda el archivo .pem en un lugar seguro, lo necesitarás para conectarte
   - Este archivo es tu llave privada y no podrás descargarlo nuevamente
![Crear Par de Claves](attached_assets/key-pair.png)

### 4. Configurar Red
1. En "Network settings":
   - VPC: Deja la VPC predeterminada
   - Subnet: No preference
   - Auto-assign public IP: Enable
2. Firewall (security groups):
   - Crea un nuevo grupo de seguridad
   - Nombre: "discord-bot-sg"
   - Description: "Security group for Discord bot"
   - Reglas de entrada:
     - Type: SSH
     - Port: 22
     - Source: Anywhere-IPv4
![Grupo de Seguridad](attached_assets/security-group.png)
3. En "Configure storage":
   - Deja el volumen predeterminado de 8 GB (suficiente para el bot)
4. Revisa y lanza:
   - Clic en "Launch instance"

### 5. Conectarse a la Instancia
1. Espera que la instancia esté "Running" (2-3 minutos)
2. Copia la "Public IPv4 address" de tu instancia
![Conectar a la Instancia](attached_assets/connect-instance.png)
3. En Windows:
   - Abre PowerShell como administrador
   - Navega a la carpeta donde guardaste el archivo .pem
   - Ejecuta estos comandos:
     ```powershell
     # Ajusta permisos del archivo .pem (requerido solo la primera vez)
     icacls "discord-bot-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"

     # Conéctate a la instancia (reemplaza XX.XX.XX.XX con tu IP)
     ssh -i "discord-bot-key.pem" ubuntu@XX.XX.XX.XX
     ```
4. En Linux/Mac:
   ```bash
   # Ajusta permisos del archivo .pem (requerido solo la primera vez)
   chmod 400 discord-bot-key.pem

   # Conéctate a la instancia (reemplaza XX.XX.XX.XX con tu IP)
   ssh -i discord-bot-key.pem ubuntu@XX.XX.XX.XX
   ```

### 6. Instalar el Bot
Una vez conectado a la instancia:
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>

# Ejecutar script de configuración
chmod +x setup-ec2.sh
./setup-ec2.sh

# Configurar credenciales
nano .env

# Iniciar el bot
./start.sh
```

### Comandos Útiles para Gestionar el Bot
```bash
# Ver logs del bot
pm2 logs discord-bot

# Ver estado del bot
pm2 status

# Reiniciar el bot
pm2 restart discord-bot

# Detener el bot
pm2 stop discord-bot

# Configurar inicio automático
pm2 startup
pm2 save
```

## Solución de Problemas

### Error al Conectar por SSH
1. Verifica que el archivo .pem tenga los permisos correctos
2. Asegúrate de usar el usuario correcto (ubuntu)
3. Confirma que la IP sea la correcta
4. Verifica que el grupo de seguridad permita SSH

### El Bot No Responde
1. Verifica las credenciales en `.env`
2. Revisa los logs: `pm2 logs discord-bot`
3. Asegúrate que el bot tenga permisos en Discord

### Errores de Conexión
1. Verifica que la instancia esté ejecutándose
2. Confirma que puedes hacer ping a la instancia
3. Revisa el grupo de seguridad permite SSH

### Costos y Recursos
- La instancia t2.micro está en la capa gratuita de AWS
- Monitorea el uso de CPU y memoria con: `htop`
- Revisa el dashboard de AWS para controlar costos

Para más ayuda, revisa los logs o abre un issue en el repositorio.