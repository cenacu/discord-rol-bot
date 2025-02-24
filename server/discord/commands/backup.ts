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
    .setDescription("Exporta los datos del servidor (monedas, personajes y balances)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  const importData = new SlashCommandBuilder()
    .setName("importar-datos")
    .setDescription("Importa datos desde un archivo CSV")
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

        // Obtener monedas
        const currencies = await storage.getCurrencies(interaction.guildId!);
        const currenciesData = currencies.map(c => ({
          ...c,
          type: 'currency'
        }));

        // Obtener personajes
        const characters = await storage.getCharacters(interaction.guildId!);
        const charactersData = characters.map(c => ({
          ...c,
          type: 'character',
          createdAt: c.createdAt.toISOString(),
          languages: Array.isArray(c.languages) ? JSON.stringify(c.languages) : '[]'
        }));

        // Obtener balances de usuarios
        const balancesData = [];
        const cachedMembers = [...interaction.guild!.members.cache.values()];
        for (const member of cachedMembers) {
          const wallet = await storage.getUserWallet(interaction.guildId!, member.id);
          if (wallet) {
            for (const currency of currencies) {
              balancesData.push({
                type: 'balance',
                userId: member.id,
                username: member.user.username,
                currencyName: currency.name,
                currencySymbol: currency.symbol,
                balance: wallet.wallet[currency.name] || 0,
                lastWorked: wallet.lastWorked ? wallet.lastWorked.toISOString() : null,
                lastStolen: wallet.lastStolen ? wallet.lastStolen.toISOString() : null
              });
            }
          }
        }

        // Guardar archivos
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const currenciesFile = path.join(backupDir, `currencies_${timestamp}.csv`);
        const charactersFile = path.join(backupDir, `characters_${timestamp}.csv`);
        const balancesFile = path.join(backupDir, `balances_${timestamp}.csv`);

        fs.writeFileSync(currenciesFile, stringify(currenciesData, { header: true }));
        fs.writeFileSync(charactersFile, stringify(charactersData, { header: true }));
        fs.writeFileSync(balancesFile, stringify(balancesData, { header: true }));

        // Crear archivos adjuntos para Discord
        const currenciesAttachment = new AttachmentBuilder(currenciesFile);
        const charactersAttachment = new AttachmentBuilder(charactersFile);
        const balancesAttachment = new AttachmentBuilder(balancesFile);

        await interaction.editReply({
          content: `Backup completado. Fecha: ${timestamp}`,
          files: [currenciesAttachment, charactersAttachment, balancesAttachment]
        });

        // Limpiar archivos temporales
        fs.unlinkSync(currenciesFile);
        fs.unlinkSync(charactersFile);
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

        // Descargar y parsear el archivo
        const response = await fetch(attachment.url);
        const csvContent = await response.text();
        const records = parse(csvContent, { 
          columns: true,
          skip_empty_lines: true 
        });

        const errors: string[] = [];

        // Identificar tipo de archivo y procesar
        if (attachment.name.includes('currencies')) {
          for (const record of records) {
            try {
              await storage.createCurrency({
                guildId: interaction.guildId!,
                name: record.name,
                symbol: record.symbol
              });
            } catch (error) {
              errors.push(`Error al importar moneda: ${record.name}`);
            }
          }
        } else if (attachment.name.includes('characters')) {
          for (const record of records) {
            try {
              await storage.createCharacter({
                guildId: interaction.guildId!,
                userId: record.userId,
                name: record.name,
                level: parseInt(record.level),
                class: record.class,
                race: record.race,
                rank: record.rank || 'Rango E',
                alignment: record.alignment || 'neutral',
                languages: record.languages ? JSON.parse(record.languages) : [],
                imageUrl: record.imageUrl || null,
                n20Url: record.n20Url || null
              });
            } catch (error) {
              errors.push(`Error al importar personaje: ${record.name}`);
            }
          }
        } else if (attachment.name.includes('balances')) {
          const userBalances = new Map<string, {
            guildId: string;
            userId: string;
            wallet: Record<string, number>;
            lastWorked: Date | null;
            lastStolen: Date | null;
          }>();

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

            const userWallet = userBalances.get(record.userId)!;
            userWallet.wallet[record.currencyName] = parseInt(record.balance);
          }

          for (const [userId, walletData] of userBalances.entries()) {
            try {
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
            } catch (error) {
              errors.push(`Error al importar balance de usuario: ${userId}`);
            }
          }
        }

        if (errors.length > 0) {
          await interaction.editReply(`Datos importados con algunos errores:\n${errors.join('\n')}`);
        } else {
          await interaction.editReply(`Datos importados exitosamente de ${attachment.name}`);
        }
      } catch (error) {
        console.error("Error al importar datos:", error);
        await interaction.editReply("Hubo un error al importar los datos. Asegúrate de que el archivo CSV tenga el formato correcto.");
      }
    }
  });
}