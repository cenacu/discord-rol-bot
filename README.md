# Bot de Discord para Comunidades de Rol

Bot de Discord avanzado especializado en comunidades de juegos de rol, con funcionalidades de gestión comunitaria y servicios en la nube.

## Características
- Gestión de personajes y campañas
- Sistema de economía y comercio
- Respaldos automáticos
- Integración con AWS DynamoDB

## Configuración

### Requisitos
- Node.js v20 o superior
- Cuenta de Discord Developer
- Cuenta de AWS (para DynamoDB)

### Variables de Entorno
Copia `.env.example` a `.env` y configura las siguientes variables:
```env
# Discord Bot
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=1342885981291942020
PUBLIC_KEY=fe8d6060843e703feced2f7cedec49321b6edd5c568fb3535b5dd18674985740

# AWS DynamoDB
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-2
```

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar el bot
npm run dev
```

## Despliegue en AWS EC2
Ver la [guía detallada de despliegue](DEPLOY.md) para instrucciones paso a paso.

## Contribuir
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.