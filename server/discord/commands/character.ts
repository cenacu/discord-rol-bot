import { Client, SlashCommandBuilder, EmbedBuilder, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { storage } from "../../storage";

export default function registerCharacterCommands(
  client: Client, 
  commands: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody>
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
      option.setName("rango")
        .setDescription("Rango del personaje")
        .setRequired(true)
        .addChoices(
          { name: 'Rango E', value: 'Rango E' },
          { name: 'Rango D', value: 'Rango D' },
          { name: 'Rango C', value: 'Rango C' },
          { name: 'Rango B', value: 'Rango B' },
          { name: 'Rango A', value: 'Rango A' }
        ))
    .addStringOption(option =>
      option.setName("idiomas")
        .setDescription("Idiomas que conoce el personaje (separados por comas)")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("imagen")
        .setDescription("URL de la imagen del personaje")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("n20")
        .setDescription("URL adicional para N20")
        .setRequired(false));

  const viewCharactersCommand = new SlashCommandBuilder()
    .setName("ver-personajes")
    .setDescription("Muestra tus personajes creados");

  const deleteCharacterCommand = new SlashCommandBuilder()
    .setName("eliminar-personaje")
    .setDescription("Elimina uno de tus personajes")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre del personaje a eliminar")
        .setRequired(true));

  const editCharacterCommand = new SlashCommandBuilder()
    .setName("editar-personaje")
    .setDescription("Edita el nivel o rango de uno de tus personajes")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre del personaje a editar")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("nivel")
        .setDescription("Nuevo nivel del personaje")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20))
    .addStringOption(option =>
      option.setName("rango")
        .setDescription("Nuevo rango del personaje")
        .setRequired(false)
        .addChoices(
          { name: 'Rango E', value: 'Rango E' },
          { name: 'Rango D', value: 'Rango D' },
          { name: 'Rango C', value: 'Rango C' },
          { name: 'Rango B', value: 'Rango B' },
          { name: 'Rango A', value: 'Rango A' }
        ));

  // Agregar comandos a la colección
  commands.set(createCharacterCommand.name, createCharacterCommand.toJSON());
  commands.set(viewCharactersCommand.name, viewCharactersCommand.toJSON());
  commands.set(deleteCharacterCommand.name, deleteCharacterCommand.toJSON());
  commands.set(editCharacterCommand.name, editCharacterCommand.toJSON());

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
        const rank = interaction.options.getString("rango", true);
        const languages = interaction.options.getString("idiomas", true)
          .split(",")
          .map(lang => lang.trim())
          .filter(lang => lang.length > 0);
        const imageUrl = interaction.options.getString("imagen");
        const n20Url = interaction.options.getString("n20");

        const character = await storage.createCharacter({
          guildId: interaction.guildId!,
          userId: interaction.user.id,
          name,
          level,
          class: characterClass,
          race,
          alignment,
          rank,
          languages,
          imageUrl,
          n20Url
        });

        const embed = new EmbedBuilder()
          .setTitle(`¡Personaje creado!`)
          .setDescription(`**${name}** ha sido agregado a tu colección.`)
          .addFields(
            { name: 'Nivel', value: level.toString(), inline: true },
            { name: 'Clase', value: characterClass, inline: true },
            { name: 'Raza', value: race, inline: true },
            { name: 'Rango', value: rank, inline: true },
            { name: 'Alineamiento', value: alignment.replace('_', ' '), inline: true },
            { name: 'Idiomas', value: languages.join(", "), inline: false }
          )
          .setTimestamp()
          .setColor('#00ff00');

        if (imageUrl) {
          embed.setImage(imageUrl);
        }

        if (n20Url) {
          embed.addFields({ name: 'N20', value: `[Ver en N20](${n20Url})`, inline: false });
        }

        await interaction.reply({ embeds: [embed], ephemeral: false });
      } catch (error) {
        console.error("Error al crear personaje:", error);
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

        const embeds = userCharacters.map(char => {
          const embed = new EmbedBuilder()
            .setTitle(char.name)
            .addFields(
              { name: 'Clase', value: char.class, inline: true },
              { name: 'Raza', value: char.race, inline: true },
              { name: 'Nivel', value: char.level.toString(), inline: true },
              { name: 'Rango', value: char.rank, inline: true },
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

        await interaction.reply({
          content: `**Tus personajes** (${userCharacters.length}):`,
          embeds: embeds,
          ephemeral: true
        });
      } catch (error) {
        console.error("Error al obtener personajes:", error);
        await interaction.reply({
          content: "Hubo un error al obtener los personajes",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "eliminar-personaje") {
      try {
        const name = interaction.options.getString("nombre", true);
        const characters = await storage.getCharacters(interaction.guildId!);
        const character = characters.find(
          c => c.userId === interaction.user.id && c.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
          await interaction.reply({
            content: `No se encontró ningún personaje con el nombre "${name}" o no eres su propietario.`,
            ephemeral: true
          });
          return;
        }

        await storage.deleteCharacter(character.id);

        const embed = new EmbedBuilder()
          .setTitle(`Personaje eliminado`)
          .setDescription(`**${character.name}** ha sido eliminado de tu colección.`)
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error("Error al eliminar personaje:", error);
        await interaction.reply({
          content: "Hubo un error al eliminar el personaje",
          ephemeral: true
        });
      }
    }

    if (interaction.commandName === "editar-personaje") {
      try {
        const name = interaction.options.getString("nombre", true);
        const newLevel = interaction.options.getInteger("nivel");
        const newRank = interaction.options.getString("rango");

        // Verificar que al menos se proporcione un campo para editar
        if (!newLevel && !newRank) {
          await interaction.reply({
            content: "Debes proporcionar al menos un campo para editar (nivel o rango).",
            ephemeral: true
          });
          return;
        }

        const characters = await storage.getCharacters(interaction.guildId!);
        const character = characters.find(
          c => c.userId === interaction.user.id && c.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
          await interaction.reply({
            content: `No se encontró ningún personaje con el nombre "${name}" o no eres su propietario.`,
            ephemeral: true
          });
          return;
        }

        const updatedCharacter = await storage.updateCharacter(character.id, {
          ...(newLevel && { level: newLevel }),
          ...(newRank && { rank: newRank })
        });

        const embed = new EmbedBuilder()
          .setTitle(`Personaje actualizado`)
          .setDescription(`**${character.name}** ha sido actualizado.`)
          .addFields(
            ...(newLevel ? [
              { name: 'Nivel anterior', value: character.level.toString(), inline: true },
              { name: 'Nivel nuevo', value: newLevel.toString(), inline: true }
            ] : []),
            ...(newRank ? [
              { name: 'Rango anterior', value: character.rank, inline: true },
              { name: 'Rango nuevo', value: newRank, inline: true }
            ] : [])
          )
          .setColor('#00ff00')
          .setTimestamp();

        if (character.imageUrl) {
          embed.setImage(character.imageUrl);
        }

        await interaction.reply({ embeds: [embed], ephemeral: false });
      } catch (error) {
        console.error("Error al editar personaje:", error);
        await interaction.reply({
          content: "Hubo un error al editar el personaje",
          ephemeral: true
        });
      }
    }
  });
}