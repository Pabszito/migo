const ReportSchema = require('../../schema/report');
const Discord = require('discord.js');

module.exports = {
    name: "deny",
    category: "utils",
    description: "Aprueba un reporte",
    run: async(client, message, args, guild) => {
        if(!message.member.permissions.has("KICK_MEMBERS"))
            return message.channel.send(`:x: | No tienes permisos para ejecutar ese comando.`);

        if(!args[0] || isNaN(args[0])) return message.channel.send(`:x: | Necesitas especificar la ID del mensaje de un reporte!`);

        ReportSchema.findOne({
            id: args[0]
        }, async(err, res) => {
            if(err) return message.channel.send(`:x: | Ocurrio un error inesperado: \`${err}\``);
            if(!res) return message.channel.send(`:x: | No se encontro un reporte con esa ID.`);
			
            await client.channels.cache.get("817874781831561288").messages.fetch(res.messageId)
				.then(msg => {
					msg.delete();
				}).catch(console.error);

            /**
            * id: Number,
            * messageId: String,
            * author: String,
            * reportedMember: String,
            * reason: String,
            * attachments: Array
            */

            let author = await client.users.fetch(res.author);
            let reportedMember = await client.users.fetch(res.reportedMember);

            let embed = new Discord.MessageEmbed()
                .setTitle(`Reporte rechazado`)
                .setDescription(`El siguiente reporte fue rechazado por ${message.author.tag}:`)
                .addField("Reportante", author.tag + " (ID: " + author.id + ")")
                .addField("Reportado", reportedMember.tag + " (ID: " + reportedMember.id + ")")
                .addField("Razón", res.reason)
                .addField("Respuesta", args[1] ? args.slice(1).join(" ") : "Reporte denegado.")
                .addField("Pruebas:", '‎', false)
                .setImage(`${res.image}`)
                .setFooter("Migo • #" + res.id, client.user.displayAvatarURL())
                .setTimestamp();

            client.channels.cache.get("770705035650269204").send(embed);

            ReportSchema.findOneAndRemove({id: args[0]}, function (err, report) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Removed report: ", report);
                }
            });
            message.channel.send(`:white_check_mark: | Has rechazado el reporte con ID \`${args[0]}\`!`)
        });
    }
};
