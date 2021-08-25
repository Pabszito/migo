const { Intents, Client } = require("discord.js");
const client = new Client({
  disableMentions: "none",
  intents: [Intents.FLAGS.GUILDS],
});
const config = require("../config.json");
const mongoose = require("mongoose");
const CommandHandler = require("./handlers/command");

client.config = config;

const commandHandler = new CommandHandler();
(async () => {
  await commandHandler.load();
  await commandHandler.deploy();
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;
  const command = commandHandler.commands.get(commandName);

  try {
    command.execute(interaction);
  } catch (e) {
    interaction.reply(
      "Algo salió mal, por favor contacta con un administrador. error: `COMMAND_NOT_FOUND`"
    );
    throw e;
  }
});

// mongoose.connect(
//   config.uri,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//   },
//   (err) => {
//     if (err) {
//       console.error(`[ERROR] Unable to connect to the Mongo database.`);
//       return process.exit(1);
//     }
//     console.info(`[INFO] Connected to the Mongo database.`);
//   }
// );

client
  .login(config.token)
  .then(() => console.info(`[INFO] Logged in as ${client.user.tag}`))
  .catch((err) =>
    console.error(`[INFO] An error occurred while logging in. (${err})`)
  );
