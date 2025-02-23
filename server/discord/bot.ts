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

    // Update commands array in the ClientReady event handler
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
      },
      {
        name: "robar",
        description: "Intenta robar monedas de otro usuario",
        options: [
          {
            name: "usuario",
            description: "Usuario al que intentarás robar",
            type: 6, // USER
            required: true
          }
        ]
      },
      {
        name: "crear-personaje",
        description: "Crea una nueva hoja de personaje",
        options: [
          {
            name: "nombre",
            description: "Nombre del personaje",
            type: 3, // STRING
            required: true
          },
          {
            name: "nivel",
            description: "Nivel del personaje",
            type: 4, // INTEGER
            required: true,
            minValue: 1,
            maxValue: 20
          },
          {
            name: "clase",
            description: "Clase del personaje",
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Bárbaro', value: 'barbaro' },
              { name: 'Bardo', value: 'bardo' },
              { name: 'Clérigo', value: 'clerigo' },
              { name: 'Druida', value: 'druida' },
              { name: 'Guerrero', value: 'guerrero' },
              { name: 'Hechicero', value: 'hechicero' },
              { name: 'Mago', value: 'mago' },
              { name: 'Monje', value: 'monje' },
              { name: 'Paladín', value: 'paladin' },
              { name: 'Pícaro', value: 'picaro' },
              { name: 'Explorador', value: 'explorador' }
            ]
          },
          {
            name: "raza",
            description: "Raza del personaje",
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Humano', value: 'humano' },
              { name: 'Elfo', value: 'elfo' },
              { name: 'Enano', value: 'enano' },
              { name: 'Mediano', value: 'mediano' },
              { name: 'Gnomo', value: 'gnomo' },
              { name: 'Semielfo', value: 'semielfo' },
              { name: 'Semiorco', value: 'semiorco' },
              { name: 'Dracónido', value: 'draconido' },
              { name: 'Tiefling', value: 'tiefling' }
            ]
          },
          {
            name: "alineamiento",
            description: "Alineamiento del personaje",
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Legal Bueno', value: 'legal_bueno' },
              { name: 'Neutral Bueno', value: 'neutral_bueno' },
              { name: 'Caótico Bueno', value: 'caotico_bueno' },
              { name: 'Legal Neutral', value: 'legal_neutral' },
              { name: 'Neutral', value: 'neutral' },
              { name: 'Caótico Neutral', value: 'caotico_neutral' },
              { name: 'Legal Malvado', value: 'legal_malvado' },
              { name: 'Neutral Malvado', value: 'neutral_malvado' },
              { name: 'Caótico Malvado', value: 'caotico_malvado' }
            ]
          },
          {
            name: "idiomas",
            description: "Idiomas que conoce el personaje (separados por comas)",
            type: 3, // STRING
            required: true
          },
          {
            name: "imagen",
            description: "URL de la imagen del personaje",
            type: 3, // STRING
            required: false
          }
        ]
      },
      {
        name: "ver-personajes",
        description: "Muestra tus personajes creados"
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