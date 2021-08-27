const SuggestSchema = require("../../schema/suggestion");
const { Interaction, MessageEmbed } = require("discord.js");
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
    const client = interaction.client;
    let member = interaction.member;
    if (
      member.roles.cache.size <= 1 ||
      (member.roles.cache.has(config.utils.levelFiveRoleId) &&
        member.roles.cache.size === 2)
    ) {
      interaction.reply(
        ":x: | Necesitas ser nivel 10 o superior para ejecutar ese comando!"
      );
      return;
    }

    let suggestionId = this.generateId();

    let embed = new MessageEmbed()
      .setTitle(`Sugerencia ${suggestionId}`)
      .setColor("YELLOW")
      .setAuthor(member.displayName, member.user.avatarURL())
      .setDescription(
        `Hemos recibido una sugerencia! Vota con :white_check_mark: o con :x: para que sepamos si te gusta la idea o no.`
      )
      .addField(`Sugerencia:`, interaction.options.getString("sugerencia"))
      .setTimestamp()
      .setFooter("Migo", client.user.avatar);

    client.channels.cache
      .get(config.utils.suggestionChannel)
      .send({ embeds: [embed] })
      .then(async (msg) => {
        await msg.react(`✅`);
        await msg.react(`❌`);

        msg.startThread({
          name: `Sugerencia ${suggestionId}`,
          autoArchiveDuration: 24 * 60, // Time in minutes, 24h
          reason: `Needed for ${interaction.user.tag} suggestion`,
        });

        const suggestion = new SuggestSchema({
          id: msg.id,
          author: interaction.user.username,
          content: interaction.options.getString("sugerencia"),
        });

        suggestion.save();
      });

    interaction.reply(
      `:white_check_mark: | Tu sugerencia fue enviada con exito, puedes ver su progreso en <#${config.utils.suggestionChannel}>`
    );
  }

  generateId() {
    const LENGTH = 4;
    const KEYS =
      "abcdefghijklmnopqrstubwsyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let code = "";
    for (let i = 0; i < LENGTH; i++) {
      code += KEYS.charAt(Math.floor(Math.random() * KEYS.length));
    }

    return code;
  }
};
