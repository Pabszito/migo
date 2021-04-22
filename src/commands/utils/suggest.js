const SuggestSchema = require('../../schema/suggestion');
const Discord = require('discord.js');

module.exports = {
  name: "suggest",
  category: "utils",
  description: "Haz una sugerencia!",
  run: async(client, message, args, guild) => {
      if(message.member.roles.cache.size <= 1)
          return message.channel.send(`:x: | Necesitas ser nivel 10 o superior para ejecutar ese comando!`);

      if(message.member.roles.cache.has("698332177137401989") && message.member.roles.cache.size === 2)
          return message.channel.send(`:x: | Necesitas ser nivel 10 o superior para ejecutar ese comando!`);

      if(!args[0]) return message.channel.send(`:x: | Necesitas especificar una sugerencia!`);

      let embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription(`Hemos recibido una sugerencia! Vota con :white_check_mark: o con :x: para que sepamos si te gusta la idea o no.`)
          .addField(`Sugerencia:`, args.join(" "))
          .setTimestamp()
          .setFooter("Migo", client.user.displayAvatarURL());

      client.channels.cache.get("698332177997234218").send(embed).then(async(msg) => {
          await msg.react(`✅`);
          await msg.react(`❌`);

          const suggestion = new SuggestSchema({
              id: msg.id,
              author: message.author.tag,
              content: args.join(" ")
          })

          suggestion.save();
      });

      return message.channel.send(`:white_check_mark: | Tu sugerencia fue enviada con exito, ${message.author}!`)
  }
};