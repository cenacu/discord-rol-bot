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
    .setDescription("Exporta todos los datos del servidor a un archivo CSV")
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

        // Recopilar todos los datos
        const allData = [];

        // Obtener monedas
        const currencies = await storage.getCurrencies(interaction.guildId!);
        for (const currency of currencies) {
          allData.push({
            type: 'currency',
            ...currency
          });
        }

        // Obtener personajes
        const characters = await storage.getCharacters(interaction.guildId!);
        for (const character of characters) {
          allData.push({
            type: 'character',
            ...character,
            languages: Array.isArray(character.languages) ? JSON.stringify(character.languages) : '[]',
            createdAt: character.createdAt.toISOString()
          });
        }

        // Obtener transacciones
        const transactions = await storage.getTransactions(interaction.guildId!);
        for (const transaction of transactions) {
          allData.push({
            type: 'transaction',
            ...transaction,
            timestamp: transaction.timestamp.toISOString()
          });
        }

        // Obtener configuración del servidor
        const settings = await storage.getGuildSettings(interaction.guildId!);
        if (settings) {
          allData.push({
            type: 'settings',
            ...settings
          });
        }

        // Obtener balances de usuarios
        const cachedMembers = [...interaction.guild!.members.cache.values()];
        for (const member of cachedMembers) {
          const wallet = await storage.getUserWallet(interaction.guildId!, member.id);
          if (wallet) {
            for (const currency of currencies) {
              allData.push({
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

        // Guardar todo en un solo archivo CSV
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup_${timestamp}.csv`);
        const csvContent = stringify(allData, { header: true });
        fs.writeFileSync(backupFile, csvContent);

        // Enviar el archivo
        const attachment = new AttachmentBuilder(backupFile);
        await interaction.editReply({
          content: `Backup completado. Fecha: ${timestamp}`,
          files: [attachment]
        });

        // Limpiar archivo temporal
        fs.unlinkSync(backupFile);

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

        // Procesar registros por tipo
        const processedTypes = new Set<string>();
        const errors: string[] = [];

        for (const record of records) {
          try {
            switch (record.type) {
              case 'currency':
                await storage.createCurrency({
                  guildId: interaction.guildId!,
                  name: record.name,
                  symbol: record.symbol
                });
                break;

              case 'character':
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
                break;

              case 'balance':
                if (!processedTypes.has('balance')) {
                  const balances = records.filter((r: any) => r.type === 'balance');
                  const userBalances = new Map<string, {
                    guildId: string;
                    userId: string;
                    wallet: Record<string, number>;
                    lastWorked: Date | null;
                    lastStolen: Date | null;
                  }>();

                  for (const balanceRecord of balances) {
                    if (!userBalances.has(balanceRecord.userId)) {
                      userBalances.set(balanceRecord.userId, {
                        guildId: interaction.guildId!,
                        userId: balanceRecord.userId,
                        wallet: {},
                        lastWorked: balanceRecord.lastWorked ? new Date(balanceRecord.lastWorked) : null,
                        lastStolen: balanceRecord.lastStolen ? new Date(balanceRecord.lastStolen) : null
                      });
                    }

                    const userWallet = userBalances.get(balanceRecord.userId)!;
                    userWallet.wallet[balanceRecord.currencyName] = parseInt(balanceRecord.balance);
                  }

                  for (const [userId, walletData] of userBalances.entries()) {
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

                  processedTypes.add('balance');
                }
                break;

              case 'settings':
                if (record.transactionLogChannel) {
                  await storage.setTransactionLogChannel(
                    interaction.guildId!,
                    record.transactionLogChannel
                  );
                }
                break;
            }
          } catch (error) {
            console.error(`Error procesando registro de tipo ${record.type}:`, error);
            errors.push(`Error en ${record.type}: ${record.name || 'sin nombre'}`);
          }
        }

        if (errors.length > 0) {
          await interaction.editReply(`Datos importados con algunos errores:\n${errors.join('\n')}`);
        } else {
          await interaction.editReply("Datos importados exitosamente.");
        }
      } catch (error) {
        console.error("Error al importar datos:", error);
        await interaction.editReply("Hubo un error al importar los datos. Asegúrate de que el archivo CSV tenga el formato correcto.");
      }
    }
  });
}