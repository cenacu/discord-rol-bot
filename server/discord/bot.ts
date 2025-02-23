import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerAdminCommands } from "./commands/admin";
import registerCharacterCommands from "./commands/character";
import registerCurrencyCommands from "./commands/currency";

export function setupBot(token: string) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, async c => {
    console.log(`¡Bot listo! Conectado como ${c.user.tag}`);

    // Get all slash commands
    const commands = [
      {
        name: "crear-moneda",
        description: "Crea una nueva moneda para el servidor",
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
            required: true
          },
          {
            name: "raza",
            description: "Raza del personaje",
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
        name: "agregar-monedas",
        description: "Agrega monedas a un personaje",
        options: [
          {
            name: "moneda",
            description: "Nombre de la moneda",
            type: 3, // STRING
            required: true
          },
          {
            name: "cantidad",
            description: "Cantidad a agregar",
            type: 4, // INTEGER
            required: true
          }
        ]
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
        options: [
          {
            name: "canal",
            description: "Canal donde se registrarán las transacciones",
            type: 7, // CHANNEL
            required: true
          }
        ]
      }
    ];

    // Register slash commands for every guild the bot is in
    await Promise.all(
      client.guilds.cache.map(guild => 
        guild.commands.set(commands)
      )
    );
  });

  // Register all command handlers
  registerAdminCommands(client);
  registerCharacterCommands(client);
  registerCurrencyCommands(client);

  client.login(token);
  return client;
}