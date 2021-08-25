const Discord = require("discord.js");

module.exports = {
  name: "eval",
  category: "developer",
  description: "Replies with 'Hello world'.",
  run: async (client, message, args, guild) => {
    let allowedPeople = [
      "447902653842980875",
      "369491493049597952",
      "326815973703417867",
      "401371502332608512",
    ];

    if (!allowedPeople.includes(message.author.id)) return;
    if (!args[0])
      return message.channel.send(
        ":x: | Por favor especifica un codigo para evaluar."
      );

    let embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .addField(`Input`, `\`\`\`js\n${args.join(" ")}\`\`\``)
      .addField(`Output`, `\`\`\`${eval(args.join(" "))}\`\`\``)
      .setTimestamp()
      .setFooter(client.user.tag, client.user.displayAvatarURL());

    message.channel.send(embed);
  },
};
