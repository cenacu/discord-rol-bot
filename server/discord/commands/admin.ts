import { Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export function registerAdminCommands(client: Client) {
  const createCurrency = new SlashCommandBuilder()
    .setName("crear-moneda")
    .setDescription("Crea una nueva moneda para el servidor")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre de la moneda")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("simbolo")
        .setDescription("Símbolo de la moneda")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  const deleteCurrency = new SlashCommandBuilder()
    .setName("eliminar-moneda")
    .setDescription("Elimina una moneda existente del servidor")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre de la moneda a eliminar")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "crear-moneda") {
      try {
        const name = interaction.options.getString("nombre", true);
        const symbol = interaction.options.getString("simbolo", true);

        await storage.createCurrency({
          guildId: interaction.guildId!,
          name,
          symbol
        });

        await interaction.reply(`¡Moneda "${name}" (${symbol}) creada con éxito!`);
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al crear la moneda",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "eliminar-moneda") {
      try {
        const name = interaction.options.getString("nombre", true);
        const deleted = await storage.deleteCurrency(interaction.guildId!, name);

        if (deleted) {
          await interaction.reply(`Moneda "${name}" eliminada con éxito.`);
        } else {
          await interaction.reply({
            content: `No se encontró una moneda llamada "${name}"`,
            ephemeral: true
          });
        }
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al eliminar la moneda",
          ephemeral: true
        });
      }
    }
  });
}