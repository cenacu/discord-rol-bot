import { Client, SlashCommandBuilder, EmbedBuilder, Collection, RESTPostAPIChatInputApplicationCommandsJSONData } from "discord.js";
import { storage } from "../../storage";

export default function registerCharacterCommands(
  client: Client, 
  commands: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONData>
) {
  // Definir los comandos
  const createCharacterCommand = new SlashCommandBuilder()
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

  const viewCharactersCommand = new SlashCommandBuilder()
    .setName("ver-personajes")
    .setDescription("Muestra tus personajes creados");

  // Agregar comandos a la colección
  commands.set(createCharacterCommand.name, createCharacterCommand.toJSON());
  commands.set(viewCharactersCommand.name, viewCharactersCommand.toJSON());

  // Manejar las interacciones de comandos
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
        const imageUrl = interaction.options.getString("imagen");

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

        const embed = new EmbedBuilder()
          .setTitle(`¡Personaje creado!`)
          .setDescription(`**${name}** ha sido agregado a tu colección.`)
          .addFields(
            { name: 'Nivel', value: level.toString(), inline: true },
            { name: 'Clase', value: characterClass, inline: true },
            { name: 'Raza', value: race, inline: true },
            { name: 'Alineamiento', value: alignment.replace('_', ' '), inline: true },
            { name: 'Idiomas', value: languages.join(", "), inline: false }
          )
          .setTimestamp()
          .setColor('#00ff00');

        if (imageUrl) {
          embed.setImage(imageUrl);
        }

        await interaction.reply({ embeds: [embed], ephemeral: false });
      } catch (error) {
        console.error("Error al crear personaje:", error);
        if (!interaction.replied) {
          await interaction.reply({
            content: "Hubo un error al crear el personaje",
            ephemeral: true
          });
        }
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

        const embeds = userCharacters.map(char => {
          const embed = new EmbedBuilder()
            .setTitle(char.name)
            .setDescription(`Nivel ${char.level} ${char.race} ${char.class}`)
            .addFields(
              { name: 'Clase', value: char.class, inline: true },
              { name: 'Raza', value: char.race, inline: true },
              { name: 'Nivel', value: char.level.toString(), inline: true },
              { name: 'Alineamiento', value: char.alignment.replace('_', ' '), inline: true },
              { name: 'Idiomas', value: char.languages.join(", "), inline: false },
              { name: 'Creado', value: char.createdAt.toLocaleDateString(), inline: true }
            )
            .setTimestamp()
            .setColor('#0099ff');

          if (char.imageUrl) {
            embed.setImage(char.imageUrl);
          }

          return embed;
        });

        if (!interaction.replied) {
          await interaction.reply({
            content: `**Tus personajes** (${userCharacters.length}):`,
            embeds: embeds,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error al obtener personajes:", error);
        if (!interaction.replied) {
          await interaction.reply({
            content: "Hubo un error al obtener los personajes",
            ephemeral: true
          });
        }
      }
    }
  });
}