const SuggestSchema = require('../../schema/suggestion');
const Discord = require('discord.js');

module.exports = {
    name: "reject",
    category: "utils",
    description: "Aprueba una sugerencia",
    run: async(client, message, args, guild) => {
        if(!message.member.permissions.has("KICK_MEMBERS"))
            return message.channel.send(`:x: | No tienes permisos para ejecutar ese comando.`);

        if(!args[0] || isNaN(args[0])) return message.channel.send(`:x: | Necesitas especificar la ID del mensaje de una sugerencia!`);

        SuggestSchema.findOne({
            id: args[0]
        }, async(err, res) => {
            if(err) return message.channel.send(`:x: | Ocurrio un error inesperado: ${err}`);
            if(!res) return message.channel.send(`:x: | No se encontro una sugerencia con esa ID.`);

            let yesCount;
            let noCount;
			
            let suggestionMessage = await client.channels.cache.get("698332177997234218").messages.fetch(args[0])
				.then(suggestionMessage => {
					yesCount = suggestionMessage.reactions.cache.get("✅").count - 1;
					noCount = suggestionMessage.reactions.cache.get("❌").count - 1;
					suggestionMessage.delete();
				}).catch(console.error);

			if(!yesCount) yesCount = "0";
			if(!noCount) noCount = "0";

            let embed = new Discord.MessageEmbed()
                .setTitle(`Sugerencia rechazada.`)
                .setDescription(`La siguiente sugerencia fue rechazada por ${message.author.tag}:`)
                .addField("Votos", `:white_check_mark: - ${yesCount}\n:x: - ${noCount}`)
                .addField("Autor", res.author)
                .addField("Sugerencia", res.content)
                .setFooter("Migo", client.user.displayAvatarURL())
                .setTimestamp();

            if(args[1]) embed.addField(`Respuesta`, args.slice(1).join(" "))

            client.channels.cache.get("698332182011183161").send(embed);

            SuggestSchema.findOneAndDelete({ id: args[0] });

            message.channel.send(`:white_check_mark: | Has rechazado la sugerencia con ID \`${args[0]}\``)
        });
    }
};