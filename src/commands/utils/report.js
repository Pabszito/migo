const ReportSchema = require('../../schema/report');
const Discord = require('discord.js');
const yaml = require("js-yaml");
const fs = require('fs');
module.exports = {
  name: "report",
  category: "utils",
  description: "Reporta a un jugador!",
  run: async(client, message, args, guild) => {

      let reportedUser = message.mentions.users.first();

      const attachments = message.attachments.size ? message.attachments.map(attachment => attachment.proxyURL) : null;
      if(!args[1]) return message.channel.send(`:x: | Necesitas especificar un usuario y una razon!`);
      if(!attachments) return message.channel.send(`:x: | Necesitas subir una imagen que funcione como evidencia!`)
      
      let reportId = parseInt(client.config.lastReportId) + 1;
      let config = client.config;

      config.lastReportId = reportId;

      await fs.writeFileSync('./config.json', JSON.stringify(config), 'utf8');

      let embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setTitle(`Hemos recibido un reporte nuevo!`)
          .addField("Reportante:", `${message.author.tag} (ID: ${message.author.id})`)
          .addField(`Reportado:`, `${reportedUser.tag} (ID: ${reportedUser.id})`)
          .addField("Razón:", `${args.slice(1).join(" ")}`)
          .addField("Archivos adjuntos:", '‎', false)
          .setImage(`${attachments ? `${attachments.join('\n')}` : null}`)
          .setFooter(`Migo • #${reportId}`, client.user.displayAvatarURL())
          .setTimestamp();

      let reportMessage = await client.channels.cache.get("817874781831561288").send(embed);

      const report = new ReportSchema({
            id: reportId,
            messageId: reportMessage.id,
            author: message.author.id,
            reportedMember: reportedUser.id,
            reason: args.slice(1).join(" "),
            image: attachments.join('\n')
      });

      report.save();
      
      return message.channel.send(`:white_check_mark: | Tu reporte fue enviado con exito, ${message.author}!`)
  }
};
