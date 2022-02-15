const Migo = require('./src/struct/migo');
const CommandManager = require('./src/manager/command');
const config = require('./config.json');
const language = require('./language.json');

const migo = new Migo(config);
const client = migo.getClient();
const logger = client.logger;
const commandManager = new CommandManager(config, logger);

(async() => {
    await commandManager.load();
    await commandManager.deploy();
})();

client.language = language;

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);

    client.user.setActivity(config.status.value, { type: config.status.type });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    
    const { commandName } = interaction;
    const command = commandManager.commands.get(commandName);
    
    try {
        await command.execute(interaction);
    } catch (exception) {
        await interaction.reply({
            content: language.general.unknown_interaction_error,
            ephemeral: true
        });
        
        logger.error(exception);
    }
});

client.attachments = new Map();

client.ws.on('INTERACTION_CREATE', (interaction) => {
    if (interaction.data.name == 'report' && interaction.data.options[2].type == 11) {
        client.attachments.set(
            interaction.id,
            interaction.data.resolved.attachments[interaction.data.options[2].value]
        );
    }
});

migo.start();