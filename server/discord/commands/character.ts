import { Client, SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export function registerCharacterCommands(client: Client) {
  const createCharacter = new SlashCommandBuilder()
    .setName("crear-personaje")
    .setDescription("Crea una nueva hoja de personaje")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre del personaje")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("nivel")
        .setDescription("Nivel del personaje")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20))
    .addStringOption(option =>
      option.setName("clase")
        .setDescription("Clase del personaje")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("raza")
        .setDescription("Raza del personaje")
        .setRequired(true));

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "crear-personaje") {
      try {
        const name = interaction.options.getString("nombre", true);
        const level = interaction.options.getInteger("nivel", true);
        const characterClass = interaction.options.getString("clase", true);
        const race = interaction.options.getString("raza", true);

        const character = await storage.createCharacter({
          guildId: interaction.guildId!,
          userId: interaction.user.id,
          name,
          level,
          class: characterClass,
          race
        });

        await interaction.reply(`¡Personaje "${name}" creado con éxito!\n` +
          `Nivel: ${level}\n` +
          `Clase: ${characterClass}\n` +
          `Raza: ${race}`);
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al crear el personaje",
          ephemeral: true
        });
      }
    }
  });
}