const {Client, Intents} = require("discord.js");
const winston = require('winston');
const DatabaseManager = require("../manager/database");

module.exports = class Migo {

    constructor(config) {
        this.config = config;
        this.client = new Client({disableMentions: "none", intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
        this.client.config = config;
        this.client.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/warnings.log', level: 'warn' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ],
            format: winston.format.combine(
                winston.format.timestamp({
                   format: 'MMM-DD-YYYY HH:mm:ss'
                }),
                winston.format.printf(info => `[${info.level.toUpperCase()} - ${[info.timestamp]}] ${info.message}`),
            )
        });

        this.databaseManager = new DatabaseManager(config, this.client.logger);
    }

    async start() {
        await this.databaseManager.init();
        this.client.login(this.config.token);
    }

    getLogger() { return this.client.logger; }

    getClient() { return this.client; }

    getDatabaseManager() { return this.databaseManager; }
}