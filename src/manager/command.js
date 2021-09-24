const Command = require("../struct/command");
const config = require("../../config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { readdirSync } = require("fs");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class CommandManager {
      
    constructor(config, logger) {
        this.commands = new Map();
        this.rest = new REST({ version: "9" }).setToken(config.token);
        this.logger = logger;
        this.commandsData = [];
    }

    async register(command) {
        command.data.default_permission = null;
        this.commands.set(command.data.name, command);
        this.commandsData.push(command.data instanceof SlashCommandBuilder 
            ? command.data.toJSON() 
            : command.data
        );
    }

    async load() {
        const dirCommands = readdirSync(`./src/commands/`).filter((file) =>
            file.endsWith(".js")
        );
        
        for (let file of dirCommands) {
            let command = require(`../commands/${file}`);
            try {
                command = new command();
            } catch (e) {
                this.logger.warn("Unable to load command " + file);
                continue;
            }

            if (!(command instanceof Command)) {
                continue;
            }

            if (!command.data.name) {
                continue;
            }

            await this.register(command);
            this.logger.info(`Successfully loaded command ${command.data.name}`);
        }
    }

    async deploy() {
        await this.rest.put(
            Routes.applicationGuildCommands(config.interactions.client_id, config.interactions.guild_id),
            { body: this.commandsData },
        );
        this.logger.info(`Finished reloading application (/) commands.`);
    }
};