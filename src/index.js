const Discord = require("discord.js");
const client = new Discord.Client({disableMentions: "none"});
const config = require('../config.json');
const mongoose = require('mongoose');

client.config = config;
client.commands = new Map();

["command", "event"].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err) => {
    if(err) {
        console.error(`[ERROR] Unable to connect to the Mongo database.`);
        return process.exit(1);
    }
    console.info(`[INFO] Connected to the Mongo database.`)
});

client.login(config.token)
    .then(() => console.info(`[INFO] Logged in as ${client.user.tag}`))
    .catch((err) => console.error(`[INFO] An error occurred while logging in. (${err})`));
