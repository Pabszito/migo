const ReportSchema = require("../../schema/report");
const { Interaction, MessageEmbed } = require("discord.js");
const yaml = require("js-yaml");
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
    let reportId = parseInt(client.config.lastReportId) + 1;

    config.lastReportId = reportId;

    await fs.writeFileSync("./config.json", JSON.stringify(config), "utf8");

    let embed = new MessageEmbed()
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
      .setColor("YELLOW")
      .setTitle(`Hemos recibido un reporte nuevo!`)
      .addField(
        "Reportante:",
        `${interaction.user.tag} (ID: ${interaction.user.id})`
      )
      .addField(`Reportado:`, `${reportedUser.tag} (ID: ${reportedUser.id})`)
      .addField("Razón:", `${interaction.options.getString("razón")}`)
      .addField("Archivos adjuntos:", "‎", false)
      // .setImage(`${attachments ? `${attachments.join("\n")}` : null}`)
      .setFooter(`Migo • #${reportId}`, client.user.displayAvatarURL())
      .setTimestamp();

    await client.channels.cache
      .get(config.utils.reportChannel)
      .send({ embeds: [embed] });

    interaction.reply(
      `:white_check_mark: | Tu reporte fue enviado con exito, puedes ver su progreso en <#${config.utils.reportChannel}>`
    );
  }
};
