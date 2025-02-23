import { Client, SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export default function registerCharacterCommands(client: Client) {
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
        .setRequired(true)
        .addChoices(
          { name: 'Bárbaro', value: 'barbaro' },
          { name: 'Bardo', value: 'bardo' },
          { name: 'Clérigo', value: 'clerigo' },
          { name: 'Druida', value: 'druida' },
          { name: 'Guerrero', value: 'guerrero' },
          { name: 'Hechicero', value: 'hechicero' },
          { name: 'Mago', value: 'mago' },
          { name: 'Monje', value: 'monje' },
          { name: 'Paladín', value: 'paladin' },
          { name: 'Pícaro', value: 'picaro' },
          { name: 'Explorador', value: 'explorador' }
        ))
    .addStringOption(option =>
      option.setName("raza")
        .setDescription("Raza del personaje")
        .setRequired(true)
        .addChoices(
          { name: 'Humano', value: 'humano' },
          { name: 'Elfo', value: 'elfo' },
          { name: 'Enano', value: 'enano' },
          { name: 'Mediano', value: 'mediano' },
          { name: 'Gnomo', value: 'gnomo' },
          { name: 'Semielfo', value: 'semielfo' },
          { name: 'Semiorco', value: 'semiorco' },
          { name: 'Dracónido', value: 'draconido' },
          { name: 'Tiefling', value: 'tiefling' }
        ))
    .addStringOption(option =>
      option.setName("alineamiento")
        .setDescription("Alineamiento del personaje")
        .setRequired(true)
        .addChoices(
          { name: 'Legal Bueno', value: 'legal_bueno' },
          { name: 'Neutral Bueno', value: 'neutral_bueno' },
          { name: 'Caótico Bueno', value: 'caotico_bueno' },
          { name: 'Legal Neutral', value: 'legal_neutral' },
          { name: 'Neutral', value: 'neutral' },
          { name: 'Caótico Neutral', value: 'caotico_neutral' },
          { name: 'Legal Malvado', value: 'legal_malvado' },
          { name: 'Neutral Malvado', value: 'neutral_malvado' },
          { name: 'Caótico Malvado', value: 'caotico_malvado' }
        ))
    .addStringOption(option =>
      option.setName("idiomas")
        .setDescription("Idiomas que conoce el personaje (separados por comas)")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("imagen")
        .setDescription("URL de la imagen del personaje")
        .setRequired(false));

  const viewCharacters = new SlashCommandBuilder()
    .setName("ver-personajes")
    .setDescription("Muestra tus personajes creados");

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "crear-personaje") {
      try {
        const name = interaction.options.getString("nombre", true);
        const level = interaction.options.getInteger("nivel", true);
        const characterClass = interaction.options.getString("clase", true);
        const race = interaction.options.getString("raza", true);
        const alignment = interaction.options.getString("alineamiento", true);
        const languages = interaction.options.getString("idiomas", true)
          .split(",")
          .map(lang => lang.trim())
          .filter(lang => lang.length > 0);
        const imageUrl = interaction.options.getString("imagen") || null;

        const character = await storage.createCharacter({
          guildId: interaction.guildId!,
          userId: interaction.user.id,
          name,
          level,
          class: characterClass,
          race,
          alignment,
          languages,
          imageUrl
        });

        await interaction.reply({
          content: `¡Personaje "${name}" creado con éxito!\n` +
            `Nivel: ${level}\n` +
            `Clase: ${characterClass}\n` +
            `Raza: ${race}\n` +
            `Alineamiento: ${alignment}\n` +
            `Idiomas: ${languages.join(", ")}\n` +
            (imageUrl ? `Imagen: ${imageUrl}` : ""),
          ephemeral: false
        });
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al crear el personaje",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "ver-personajes") {
      try {
        const characters = await storage.getCharacters(interaction.guildId!);
        const userCharacters = characters.filter(c => c.userId === interaction.user.id);

        if (userCharacters.length === 0) {
          await interaction.reply({
            content: "No tienes personajes creados aún.",
            ephemeral: true
          });
          return;
        }

        const characterList = userCharacters.map(char => 
          `**${char.name}** (Nivel ${char.level})\n` +
          `• Clase: ${char.class}\n` +
          `• Raza: ${char.race}\n` +
          `• Alineamiento: ${char.alignment}\n` +
          `• Idiomas: ${char.languages.join(", ")}\n` +
          (char.imageUrl ? `• [Ver imagen](${char.imageUrl})\n` : "") +
          `• Creado: ${char.createdAt.toLocaleDateString()}\n`
        ).join("\n");

        await interaction.reply({
          content: `**Tus personajes:**\n\n${characterList}`,
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          content: "Hubo un error al obtener los personajes",
          ephemeral: true
        });
      }
    }
  });
}