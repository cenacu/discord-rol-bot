
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import registerCharacterCommands from './discord/commands/character';
import { Collection } from 'discord.js';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !token) {
  console.error('Error: Se requieren las variables CLIENT_ID y DISCORD_TOKEN en el archivo .env');
  process.exit(1);
}

const commands = new Collection();

// Registramos los comandos
registerCharacterCommands(null as any, commands);

// Convertimos los comandos a formato JSON
const commandsJson = Array.from(commands.values());

// Creamos una instancia de REST
const rest = new REST({ version: '10' }).setToken(token);

// Función principal
(async () => {
  try {
    console.log(`Iniciando actualización de ${commandsJson.length} comandos...`);

    // La ruta para actualizar los comandos globales
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandsJson }
    );

    console.log(`¡Comandos actualizados exitosamente! (${(data as any).length} comandos)`);
  } catch (error) {
    console.error('Error al actualizar los comandos:', error);
  }
})();
