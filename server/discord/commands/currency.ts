import { Client, SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export function registerCurrencyCommands(client: Client) {
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

        await storage.updateCharacterWallet(character.id, newWallet);
        await interaction.reply(`Agregadas ${amount} ${currency.symbol} a ${character.name}`);
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al agregar monedas",
          ephemeral: true
        });
      }
    }
  });
}