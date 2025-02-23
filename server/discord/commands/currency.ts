import { Client, SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export default function registerCurrencyCommands(client: Client) {
  const listCurrencies = new SlashCommandBuilder()
    .setName("monedas")
    .setDescription("Lista todas las monedas disponibles");

  const addCurrency = new SlashCommandBuilder()
    .setName("agregar-monedas")
    .setDescription("Agrega monedas a un personaje")
    .addStringOption(option =>
      option.setName("moneda")
        .setDescription("Nombre de la moneda")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("cantidad")
        .setDescription("Cantidad a agregar")
        .setRequired(true));

  const checkBalance = new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Muestra tu balance actual de monedas");

  const transferCurrency = new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("Transfiere monedas a otro usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario que recibirá las monedas")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("moneda")
        .setDescription("Nombre de la moneda")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("cantidad")
        .setDescription("Cantidad a transferir")
        .setRequired(true)
        .setMinValue(1));

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "monedas") {
      try {
        const currencies = await storage.getCurrencies(interaction.guildId!);
        if (currencies.length === 0) {
          await interaction.reply("No hay monedas configuradas en este servidor.");
          return;
        }

        const list = currencies.map(c => `${c.name} (${c.symbol})`).join("\n");
        await interaction.reply(`Monedas disponibles:\n${list}`);
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al listar las monedas",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "agregar-monedas") {
      try {
        const currencyName = interaction.options.getString("moneda", true);
        const amount = interaction.options.getInteger("cantidad", true);

        const character = await storage.getCharacter(interaction.guildId!, interaction.user.id);
        if (!character) {
          await interaction.reply({
            content: "Primero debes crear un personaje usando /crear-personaje",
            ephemeral: true
          });
          return;
        }

        const currencies = await storage.getCurrencies(interaction.guildId!);
        const currency = currencies.find(c => c.name === currencyName);
        if (!currency) {
          await interaction.reply({
            content: "Moneda no encontrada",
            ephemeral: true
          });
          return;
        }

        const newWallet = { ...character.wallet };
        newWallet[currencyName] = (newWallet[currencyName] || 0) + amount;

        await storage.updateCharacterWallet(character.id.toString(), newWallet);
        await interaction.reply(`Agregadas ${amount} ${currency.symbol} a ${character.name}`);
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al agregar monedas",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "balance") {
      try {
        const character = await storage.getCharacter(interaction.guildId!, interaction.user.id);
        if (!character) {
          await interaction.reply({
            content: "Primero debes crear un personaje usando /crear-personaje",
            ephemeral: true
          });
          return;
        }

        const currencies = await storage.getCurrencies(interaction.guildId!);
        if (currencies.length === 0) {
          await interaction.reply("No hay monedas configuradas en este servidor.");
          return;
        }

        const balanceLines = currencies.map(currency => {
          const amount = character.wallet[currency.name] || 0;
          return `${currency.name}: ${amount} ${currency.symbol}`;
        });

        await interaction.reply({
          content: `Balance de ${character.name}:\n${balanceLines.join("\n")}`,
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al consultar tu balance",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "transferir") {
      try {
        const targetUser = interaction.options.getUser("usuario", true);
        const currencyName = interaction.options.getString("moneda", true);
        const amount = interaction.options.getInteger("cantidad", true);

        // Get both characters
        const fromCharacter = await storage.getCharacter(interaction.guildId!, interaction.user.id);
        const toCharacter = await storage.getCharacter(interaction.guildId!, targetUser.id);

        if (!fromCharacter) {
          await interaction.reply({
            content: "Primero debes crear un personaje usando /crear-personaje",
            ephemeral: true
          });
          return;
        }

        if (!toCharacter) {
          await interaction.reply({
            content: "El usuario destino no tiene un personaje creado",
            ephemeral: true
          });
          return;
        }

        // Verify currency exists
        const currencies = await storage.getCurrencies(interaction.guildId!);
        const currency = currencies.find(c => c.name === currencyName);
        if (!currency) {
          await interaction.reply({
            content: "Moneda no encontrada",
            ephemeral: true
          });
          return;
        }

        // Verify sender has enough funds
        const currentBalance = fromCharacter.wallet[currencyName] || 0;
        if (currentBalance < amount) {
          await interaction.reply({
            content: `No tienes suficientes ${currency.symbol}`,
            ephemeral: true
          });
          return;
        }

        // Perform transfer
        const transaction = await storage.transferCurrency(
          interaction.guildId!,
          fromCharacter.id.toString(),
          toCharacter.id.toString(),
          currencyName,
          amount
        );

        // Send confirmation
        await interaction.reply(`Transferencia exitosa: ${amount} ${currency.symbol} enviados a ${toCharacter.name}`);

        // Log transaction if channel is configured
        const settings = await storage.getGuildSettings(interaction.guildId!);
        if (settings?.transactionLogChannel) {
          const channel = await interaction.guild?.channels.fetch(settings.transactionLogChannel);
          if (channel?.isTextBased()) {
            await channel.send(
              `💰 Nueva transferencia:\n` +
              `De: ${fromCharacter.name}\n` +
              `Para: ${toCharacter.name}\n` +
              `Cantidad: ${amount} ${currency.symbol}\n` +
              `Fecha: ${transaction.timestamp.toLocaleString()}`
            );
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Insufficient funds") {
          await interaction.reply({
            content: "No tienes suficientes fondos para esta transferencia",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "Hubo un error al realizar la transferencia",
            ephemeral: true
          });
        }
      }
    }
  });
}