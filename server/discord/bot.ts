import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerAdminCommands } from "./commands/admin";
import { registerCharacterCommands } from "./commands/character";
import { registerCurrencyCommands } from "./commands/currency";

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
    const adminCmd = {
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
    };

    const characterCmd = {
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
    };

    const currencyListCmd = {
      name: "monedas",
      description: "Lista todas las monedas disponibles"
    };

    const addCurrencyCmd = {
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
    };

    // Register slash commands for every guild the bot is in
    await Promise.all(
      client.guilds.cache.map(guild => 
        guild.commands.set([adminCmd, characterCmd, currencyListCmd, addCurrencyCmd])
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