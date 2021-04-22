module.exports = async (client,message) => {
    let prefix = client.config.prefix;

    if (message.guild.id !== "698332177137401987") {
        return;
    }
    
    if (message.author.bot) {
        return;
    }

    if (message.channel.type === "dm") {
        return;
    }

    if(message.content.includes("<@!401371502332608512>") || message.content.includes("<@401371502332608512>")) {
        await message.react("698341136300769322");
        return message.channel.send(`:warning: | Hey ${message.author}, no menciones a Ajneb! Puedes contactar con el a traves de Facebook, Twitter o por Spigot. <#698332177997234216>`)
    }

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if (!command.startsWith(prefix)) return;

    let cmd = client.commands.get(command.slice(prefix.length));

    if (!cmd) return;
    if (cmd) cmd.run(client, message, args);
}
