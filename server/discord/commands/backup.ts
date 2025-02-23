import { Client, SlashCommandBuilder, PermissionFlagsBits, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody, AttachmentBuilder } from "discord.js";
import { storage } from "../../storage";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export default function registerBackupCommands(
  client: Client,
  commands: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody>
) {
  const exportData = new SlashCommandBuilder()
    .setName("exportar-datos")
    .setDescription("Exporta todos los datos del servidor a archivos CSV")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  const importData = new SlashCommandBuilder()
    .setName("importar-datos")
    .setDescription("Importa datos desde archivos CSV")
    .addAttachmentOption(option =>
      option.setName("archivo")
        .setDescription("Archivo CSV a importar")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  commands.set(exportData.name, exportData.toJSON());
  commands.set(importData.name, importData.toJSON());

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "exportar-datos") {
      try {
        await interaction.deferReply();

        // Crear directorio de backups si no existe
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir);
        }

        // Obtener todos los datos
        const currencies = await storage.getCurrencies(interaction.guildId!);
        const characters = await storage.getCharacters(interaction.guildId!);
        const transactions = await storage.getTransactions(interaction.guildId!);
        const settings = await storage.getGuildSettings(interaction.guildId!);

        // Preparar datos de balances
        const balanceData = [];
        for (const guildMember of interaction.guild!.members.cache.values()) {
          const wallet = await storage.getUserWallet(interaction.guildId!, guildMember.id);
          if (wallet) {
            for (const currency of currencies) {
              balanceData.push({
                userId: guildMember.id,
                username: guildMember.user.username,
                currencyName: currency.name,
                currencySymbol: currency.symbol,
                balance: wallet.wallet[currency.name] || 0,
                lastWorked: wallet.lastWorked ? wallet.lastWorked.toISOString() : null,
                lastStolen: wallet.lastStolen ? wallet.lastStolen.toISOString() : null
              });
            }
          }
        }

        // Convertir a CSV
        const currenciesCSV = stringify(currencies, { header: true });
        const charactersCSV = stringify(characters, { header: true });
        const transactionsCSV = stringify(transactions, { header: true });
        const settingsCSV = stringify([settings], { header: true });
        const balancesCSV = stringify(balanceData, { header: true });

        // Guardar archivos
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const currenciesFile = path.join(backupDir, `currencies_${timestamp}.csv`);
        const charactersFile = path.join(backupDir, `characters_${timestamp}.csv`);
        const transactionsFile = path.join(backupDir, `transactions_${timestamp}.csv`);
        const settingsFile = path.join(backupDir, `settings_${timestamp}.csv`);
        const balancesFile = path.join(backupDir, `balances_${timestamp}.csv`);

        fs.writeFileSync(currenciesFile, currenciesCSV);
        fs.writeFileSync(charactersFile, charactersCSV);
        fs.writeFileSync(transactionsFile, transactionsCSV);
        fs.writeFileSync(settingsFile, settingsCSV);
        fs.writeFileSync(balancesFile, balancesCSV);

        // Crear archivos adjuntos para Discord
        const currenciesAttachment = new AttachmentBuilder(currenciesFile);
        const charactersAttachment = new AttachmentBuilder(charactersFile);
        const transactionsAttachment = new AttachmentBuilder(transactionsFile);
        const settingsAttachment = new AttachmentBuilder(settingsFile);
        const balancesAttachment = new AttachmentBuilder(balancesFile);

        await interaction.editReply({
          content: `Backup completado. Fecha: ${timestamp}`,
          files: [
            currenciesAttachment,
            charactersAttachment,
            transactionsAttachment,
            settingsAttachment,
            balancesAttachment
          ]
        });

        // Limpiar archivos temporales
        fs.unlinkSync(currenciesFile);
        fs.unlinkSync(charactersFile);
        fs.unlinkSync(transactionsFile);
        fs.unlinkSync(settingsFile);
        fs.unlinkSync(balancesFile);

      } catch (error) {
        console.error("Error al exportar datos:", error);
        await interaction.editReply("Hubo un error al exportar los datos.");
      }
    }

    if (interaction.commandName === "importar-datos") {
      try {
        await interaction.deferReply();
        const attachment = interaction.options.getAttachment("archivo", true);

        if (!attachment.name.endsWith('.csv')) {
          await interaction.editReply("Por favor proporciona un archivo CSV válido.");
          return;
        }

        // Descargar archivo
        const response = await fetch(attachment.url);
        const csvContent = await response.text();

        // Parsear CSV
        const records = parse(csvContent, { columns: true });

        // Identificar tipo de datos basado en el nombre del archivo
        if (attachment.name.includes('currencies')) {
          for (const record of records) {
            await storage.createCurrency({
              guildId: interaction.guildId!,
              name: record.name,
              symbol: record.symbol
            });
          }
        } else if (attachment.name.includes('characters')) {
          for (const record of records) {
            await storage.createCharacter({
              guildId: interaction.guildId!,
              userId: record.userId,
              name: record.name,
              level: parseInt(record.level),
              class: record.class,
              race: record.race,
              rank: record.rank,
              imageUrl: record.imageUrl,
              n20Url: record.n20Url,
              alignment: record.alignment || 'neutral',
              languages: record.languages ? JSON.parse(record.languages) : []
            });
          }
        } else if (attachment.name.includes('balances')) {
          // Procesar usuarios únicos y sus balances
          const userBalances = new Map();

          for (const record of records) {
            if (!userBalances.has(record.userId)) {
              userBalances.set(record.userId, {
                guildId: interaction.guildId!,
                userId: record.userId,
                wallet: {},
                lastWorked: record.lastWorked ? new Date(record.lastWorked) : null,
                lastStolen: record.lastStolen ? new Date(record.lastStolen) : null
              });
            }

            const userWallet = userBalances.get(record.userId);
            userWallet.wallet[record.currencyName] = parseInt(record.balance);
          }

          // Crear o actualizar billeteras
          for (const [userId, walletData] of userBalances) {
            let wallet = await storage.getUserWallet(interaction.guildId!, userId);
            if (!wallet) {
              wallet = await storage.createUserWallet({
                guildId: interaction.guildId!,
                userId: userId
              });
            }
            await storage.updateUserWallet(
              wallet.id,
              walletData.wallet,
              walletData.lastWorked,
              walletData.lastStolen
            );
          }
        }

        await interaction.editReply(`Datos importados exitosamente de ${attachment.name}`);
      } catch (error) {
        console.error("Error al importar datos:", error);
        await interaction.editReply("Hubo un error al importar los datos. Asegúrate de que el archivo CSV tenga el formato correcto.");
      }
    }
  });
}