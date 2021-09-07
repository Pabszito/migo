const { MessageEmbed, Message, Interaction } = require("discord.js");
const config = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../command");

module.exports = class AcceptCommand extends Command {
  constructor() {
    super();
    this.data = new SlashCommandBuilder()
      .setName("accept")
      .setDescription("Aceptar un reporte")
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("id")
          .setDescription("Id del mensaje del reporte que quieres aceptar")
      )
      .addStringOption((option) =>
        option
          .setRequired(false)
          .setName("respuesta")
          .setDescription(
            "Una respuesta opcional del por qué se aceptó este reporte"
          )
      );
  }

  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const client = interaction.client;
    const member = interaction.member;
    const reportId = interaction.options.getString("id");
    const optionalResponse = interaction.options.getString("respuesta");

    if (!member.permissions.has("KICK_MEMBERS")) {
      interaction.reply(`:x: | No tienes permisos para ejecutar ese comando.`);
      return;
    }

    if (isNaN(reportId)) {
      interaction.reply(
        `:x: | Necesitas especificar la ID del mensaje de un reporte!`
      );
      return;
    }

    await client.channels.cache
      .get(config.utils.reportChannel)
      .messages.fetch(reportId)
      .then(async (/** @type Message */ message) => {
        let authorFieldValue = message.embeds[0].fields[0].value;
        let reportedFieldValue = message.embeds[0].fields[1].value;

        let author = await client.users.fetch(
          authorFieldValue.slice(authorFieldValue.length - 19).replace(/\)/, "")
        );

        let reportedMember = await client.users.fetch(
          reportedFieldValue
            .slice(reportedFieldValue.length - 19)
            .replace(/\)/, "")
        );

        let embed = new MessageEmbed()
          .setTitle(`Reporte aceptado!`)
          .setColor("DARK_GREEN")
          .setDescription(
            `El siguiente reporte fue aceptado por ${message.author.tag}:`
          )
          .addField("Reportante", author.tag + " (ID: " + author.id + ")")
          .addField(
            "Reportado",
            reportedMember.tag + " (ID: " + reportedMember.id + ")"
          )
          .addField("Razón", message.embeds[0].fields[2].value)
          .addField(
            "Respuesta",
            optionalResponse ? optionalResponse : "Gracias por reportar."
          )
          .addField("Pruebas:", "‎", false)
          .setImage(message.embeds[0].image)
          .setFooter(
            message.embeds[0].footer.text,
            message.embeds[0].footer.iconURL
          )
          .setTimestamp();

        message.thread.delete();

        message.delete();

        client.channels.cache
          .get(config.utils.reportsResultsChannel)
          .send({ embeds: [embed] });
        interaction.reply(
          `:white_check_mark: | Has aceptado el reporte con ID \`${reportId}\`!`
        );
      })
      .catch((err) => {
        if (err.code === 10008) {
          interaction.reply(":x: No se ha encontrado el mensaje");
          return;
        }

        interaction.reply(":x: Algo salió mal. Por favor intenta de nuevo mas tarde.");
      });
  }
};
