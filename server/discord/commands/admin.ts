import { Client, PermissionFlagsBits, SlashCommandBuilder, ChannelType, TextChannel } from "discord.js";
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
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "canal-registro") {
      try {
        const channel = interaction.options.getChannel("canal", true);

        // Log información detallada del canal y guild
        console.log("Información del guild:", {
          guildId: interaction.guildId,
          guildName: interaction.guild?.name,
          botPermissions: interaction.guild?.members.me?.permissions.toArray()
        });

        console.log("Canal seleccionado:", {
          id: channel.id,
          name: channel.name,
          type: channel.type,
          isText: channel.isTextBased(),
          permissionFlags: channel.permissionsFor(interaction.client.user!)?.toArray()
        });

        // Verificar que el canal pueda recibir mensajes
        const permissions = channel.permissionsFor(interaction.client.user!);
        if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
          await interaction.reply({
            content: "No tengo permisos para enviar mensajes en ese canal",
            ephemeral: true
          });
          return;
        }

        if (!channel.isTextBased()) {
          await interaction.reply({
            content: "Por favor selecciona un canal de texto",
            ephemeral: true
          });
          return;
        }

        await storage.setTransactionLogChannel(interaction.guildId!, channel.id);
        await interaction.reply(`Canal de registro establecido a #${channel.name}`);

        // Enviar mensaje de prueba
        await channel.send("✅ Canal configurado correctamente para registro de transacciones.");
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