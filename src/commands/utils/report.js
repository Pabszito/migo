const { Interaction, MessageEmbed } = require("discord.js");
const fs = require("fs");
const Command = require("../../command");
const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require("../../../config.json");

module.exports = class ReportCommand extends Command {
  constructor() {
    super();
    this.data = new SlashCommandBuilder()
      .setName("report")
      .setDescription("Reportar a un usuario")
      .addUserOption((option) =>
        option
          .setRequired(true)
          .setName("reportado")
          .setDescription("La persona que quieres reportar")
      )
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("razón")
          .setDescription(
            "La razón por la cual estás reportando a este usuario"
          )
      );
  }

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const reportedUser = interaction.options.getUser("reportado");
    const client = interaction.client;
    let reportMessageId = parseInt(client.config.lastReportId) + 1;

    config.lastReportId = reportMessageId;

    await fs.writeFileSync("./config.json", JSON.stringify(config), "utf8");
    let reportId = this.generateId();
    let embed = new MessageEmbed()
      .setTitle(`Reporte ${reportId}`)
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
      .setColor("YELLOW")
      .setDescription(`Hemos recibido un reporte nuevo!`)
      .addField(
        "Reportante:",
        `${interaction.user.tag} (ID: ${interaction.user.id})`
      )
      .addField(`Reportado:`, `${reportedUser.tag} (ID: ${reportedUser.id})`)
      .addField("Razón:", `${interaction.options.getString("razón")}`)
      .addField("Archivos adjuntos:", "‎", false)
      // .setImage(`${attachments ? `${attachments.join("\n")}` : null}`)
      .setFooter(`Migo • #${reportMessageId}`, client.user.displayAvatarURL())
      .setTimestamp();

    await client.channels.cache
      .get(config.utils.reportChannel)
      .send({ embeds: [embed] })
      .then((message) => {
        message.startThread({
          name: `Reporte ${reportId}`,
          autoArchiveDuration: 24 * 60, // Time in minutes, 24h
          reason: `Needed for ${interaction.user.tag} report`,
        });
      });

    interaction.reply(
      `:white_check_mark: | Tu reporte fue enviado con exito, puedes ver su progreso en <#${config.utils.reportChannel}>`
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
