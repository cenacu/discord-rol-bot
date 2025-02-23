import { Client, PermissionFlagsBits, SlashCommandBuilder, ChannelType, TextChannel, ThreadChannel } from "discord.js";
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

  const setLogChannel = new SlashCommandBuilder()
    .setName("canal-registro")
    .setDescription("Establece el canal para registrar transacciones")
    .addChannelOption(option =>
      option.setName("canal")
        .setDescription("Canal donde se registrarán las transacciones")
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement,
          ChannelType.PublicThread,
          ChannelType.PrivateThread,
          ChannelType.AnnouncementThread
        )
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "canal-registro") {
      try {
        const channel = interaction.options.getChannel("canal", true);

        // Log información detallada del canal
        console.log("Canal seleccionado:", {
          id: channel.id,
          name: channel.name,
          type: channel.type,
          isValidChannel: [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.AnnouncementThread
          ].includes(channel.type)
        });

        // Verificar que sea un canal válido
        if (![
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement,
          ChannelType.PublicThread,
          ChannelType.PrivateThread,
          ChannelType.AnnouncementThread
        ].includes(channel.type)) {
          await interaction.reply({
            content: "Por favor selecciona un canal de texto, anuncios o hilo",
            ephemeral: true
          });
          return;
        }

        await storage.setTransactionLogChannel(interaction.guildId!, channel.id);
        await interaction.reply(`Canal de registro establecido a #${channel.name}`);

        // Enviar mensaje de prueba
        try {
          if (channel instanceof TextChannel || channel instanceof ThreadChannel) {
            await channel.send("✅ Canal configurado correctamente para registro de transacciones.");
          }
        } catch (error) {
          console.error("Error al enviar mensaje de prueba:", error);
          await interaction.followUp({
            content: "⚠️ El canal fue configurado pero no pude enviar un mensaje de prueba. Por favor verifica mis permisos.",
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error al configurar canal de registro:", error);
        await interaction.reply({
          content: "Hubo un error al configurar el canal de registro",
          ephemeral: true
        });
      }
    }

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