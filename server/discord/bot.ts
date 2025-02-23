import { Client, Events, GatewayIntentBits, PermissionFlagsBits, ChannelType } from "discord.js";
import { registerAdminCommands } from "./commands/admin";
import registerCurrencyCommands from "./commands/currency";
import registerCharacterCommands from "./commands/character";

export function setupBot(token: string) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.once(Events.ClientReady, async c => {
    console.log(`¡Bot listo! Conectado como ${c.user.tag}`);
    console.log(`Link de invitación: https://discord.com/api/oauth2/authorize?client_id=${c.user.id}&permissions=2147485696&scope=bot%20applications.commands`);

    // Get all slash commands
    const commands = [
      {
        name: "crear-moneda",
        description: "Crea una nueva moneda para el servidor",
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
        options: [
          {
            name: "nombre",
            description: "Nombre de la moneda",
            type: 3, // STRING
            required: true
          },
          {
            name: "simbolo",
            description: "Símbolo de la moneda",
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: "eliminar-moneda",
        description: "Elimina una moneda existente del servidor",
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
        options: [
          {
            name: "nombre",
            description: "Nombre de la moneda a eliminar",
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: "monedas",
        description: "Lista todas las monedas disponibles"
      },
      {
        name: "balance",
        description: "Muestra tu balance actual de monedas"
      },
      {
        name: "transferir",
        description: "Transfiere monedas a otro usuario",
        options: [
          {
            name: "usuario",
            description: "Usuario que recibirá las monedas",
            type: 6, // USER
            required: true
          },
          {
            name: "moneda",
            description: "Nombre de la moneda",
            type: 3, // STRING
            required: true
          },
          {
            name: "cantidad",
            description: "Cantidad a transferir",
            type: 4, // INTEGER
            required: true,
            minValue: 1
          }
        ]
      },
      {
        name: "canal-registro",
        description: "Establece el canal para registrar transacciones",
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
        options: [
          {
            name: "canal",
            description: "Canal donde se registrarán las transacciones",
            type: 7, // CHANNEL
            required: true,
            channel_types: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
              ChannelType.AnnouncementThread
            ]
          }
        ]
      },
      {
        name: "trabajar",
        description: "Trabaja para ganar monedas aleatorias"
      }
    ];

    // Register slash commands for every guild the bot is in
    await Promise.all(
      client.guilds.cache.map(guild => 
        guild.commands.set(commands)
          .then(() => {
            console.log(`Comandos registrados en ${guild.name}`);
            // Verificar permisos del bot en el servidor
            const botMember = guild.members.cache.get(client.user.id);
            const requiredPermissions = [
              'ViewChannel',
              'SendMessages',
              'ReadMessageHistory',
              'ManageMessages'
            ];

            const missingPermissions = requiredPermissions.filter(perm => 
              !botMember?.permissions.has(perm as PermissionFlagsBits)
            );

            if (missingPermissions.length > 0) {
              console.warn(`⚠️ Faltan permisos en ${guild.name}:`, missingPermissions);
            }
          })
          .catch(error => console.error(`Error al registrar comandos en ${guild.name}:`, error))
      )
    );
  });

  // Register commands when joining new guilds
  client.on(Events.GuildCreate, async guild => {
    try {
      const commands = await guild.commands.fetch();
      console.log(`Comandos registrados en nuevo servidor: ${guild.name}`);
    } catch (error) {
      console.error(`Error al registrar comandos en nuevo servidor ${guild.name}:`, error);
    }
  });

  // Register all command handlers
  registerAdminCommands(client);
  registerCurrencyCommands(client);
  registerCharacterCommands(client);

  client.login(token);
  return client;
}