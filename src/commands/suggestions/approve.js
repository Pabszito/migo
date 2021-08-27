const { Interaction, MessageEmbed, Message } = require("discord.js");
const config = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../command");

module.exports = class ApproveCommand extends Command {
  constructor() {
    super();
    this.data = new SlashCommandBuilder()
      .setName("approve")
      .setDescription("Aprovar una sugerencia")
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("id")
          .setDescription("La id de la sugerencia que quieres aprobar")
      )
      .addStringOption((option) =>
        option
          .setRequired(false)
          .setName("nota")
          .setDescription(
            "Una nota opcional de el por qué se aceptó esta sugerencia"
          )
      );
  }

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const client = interaction.client;
    const member = interaction.member;

    if (!member.permissions.has("KICK_MEMBERS")) {
      interaction.reply(`:x: | No tienes permisos para ejecutar ese comando.`);
      return;
    }

    const suggestionId = interaction.options.getString("id");
    let optionalNote = interaction.options.getString("nota");

    let channel = await client.channels.cache.get(
      config.utils.suggestionChannel
    );

    channel.messages
      .fetch(suggestionId)

      .then((/** @type Message */ message) => {
        let yesCount = message.reactions.cache.get("✅").count;
        let noCount = message.reactions.cache.get("❌").count;
        let suggestionContent = message.embeds[0].fields[0].value;

        if (message.hasThread) {
          message.thread.delete();
        }

        message.delete();

        let embed = new MessageEmbed()
          .setTitle(`Sugerencia aceptada!`)
          .setDescription(
            `La siguiente sugerencia fue aceptada por ${member.user.tag}:`
          )
          .addField(
            "Votos",
            `:white_check_mark: - ${yesCount}\n:x: - ${noCount}`
          )
          .addField("Autor", member.toString())
          .addField("Sugerencia", suggestionContent)
          .setFooter("Migo", client.user.displayAvatarURL())
          .setTimestamp();

        if (optionalNote) {
          embed.addField(`Respuesta`, optionalNote);
        }

        client.channels.cache
          .get(config.utils.suggestionsResultsChannel)
          .send({ embeds: [embed] });
      })
      .catch(console.error);

    interaction.reply(
      `:white_check_mark: | Has aceptado la sugerencia con ID \`${suggestionId}\`!`
    );
  }
};
