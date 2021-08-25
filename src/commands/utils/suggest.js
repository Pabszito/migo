const SuggestSchema = require("../../schema/suggestion");
const { Interaction } = require("discord.js");
const config = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../command");

module.exports = class SuggestCommand extends Command {
  constructor() {
    super();
    this.data = new SlashCommandBuilder()
      .setName("suggest")
      .setDescription("Sugiere tus ideas al resto del servidor")
      .addStringOption((option) =>
        option
          .setName("sugerencia")
          .setDescription("La sugerencia que quieres enviar.")
          .setRequired(true)
      );
  }

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    let user = interaction.member;
    if (
      user.roles.cache.size <= 1 ||
      (user.roles.cache.has(config.utils.levelFiveRoleId) &&
        user.roles.cache.size === 2)
    ) {
      interaction.reply(
        ":x: | Necesitas ser nivel 10 o superior para ejecutar ese comando!"
      );
      return;
    }

    let embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `Hemos recibido una sugerencia! Vota con :white_check_mark: o con :x: para que sepamos si te gusta la idea o no.`
      )
      .addField(`Sugerencia:`, interaction.options.getString("sugerencia"))
      .setTimestamp()
      .setFooter("Migo", client.user.displayAvatarURL());

    client.channels.cache
      .get(config.utils.suggestionChannel)
      .send(embed)
      .then(async (msg) => {
        await msg.react(`✅`);
        await msg.react(`❌`);

        const suggestion = new SuggestSchema({
          id: msg.id,
          author: user.displayName,
          content: interaction.options.getString("sugerencia"),
        });

        suggestion.save();
      });

    interaction.reply(
      `:white_check_mark: | Tu sugerencia fue enviada con exito, puedes ver su progreso en <#${config.utils.suggestionChannel}>`
    );
  }
};
