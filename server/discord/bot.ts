import { Client, Events, GatewayIntentBits, Collection, RESTPostAPIChatInputApplicationCommandsJSONData } from "discord.js";
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

  // Colección para almacenar todos los comandos
  const commands = new Collection<string, RESTPostAPIChatInputApplicationCommandsJSONData>();

  client.once(Events.ClientReady, async c => {
    console.log(`¡Bot listo! Conectado como ${c.user?.tag}`);
    console.log(`Link de invitación: https://discord.com/api/oauth2/authorize?client_id=${c.user?.id}&permissions=2147485696&scope=bot%20applications.commands`);

    try {
      // Registrar comandos en cada guild
      for (const [id, guild] of client.guilds.cache) {
        try {
          // Obtener los comandos actuales
          const currentCommands = await guild.commands.fetch();

          // Registrar los comandos
          await guild.commands.set([]);
          const registeredCommands = await guild.commands.set(
            Array.from(commands.values())
          );

          console.log(`✅ Comandos registrados en ${guild.name} (${registeredCommands.size} comandos)`);

        } catch (error) {
          console.error(`❌ Error al registrar comandos en ${guild.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error general al registrar comandos:", error);
    }
  });

  // Registrar comandos al unirse a un nuevo servidor
  client.on(Events.GuildCreate, async guild => {
    try {
      const registeredCommands = await guild.commands.set(
        Array.from(commands.values())
      );
      console.log(`✅ Comandos registrados en nuevo servidor ${guild.name} (${registeredCommands.size} comandos)`);
    } catch (error) {
      console.error(`❌ Error al registrar comandos en nuevo servidor ${guild.name}:`, error);
    }
  });

  // Registrar todos los comandos y sus handlers
  registerAdminCommands(client, commands);
  registerCurrencyCommands(client, commands);
  registerCharacterCommands(client, commands);

  client.login(token);
  return client;
}