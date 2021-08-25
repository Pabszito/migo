const Command = require("../command");
const config = require("../../config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { readdirSync } = require("fs");

module.exports = class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.rest = new REST({ version: "9" }).setToken(config.token);
    this.commandsData = [];
  }

  async register(command) {
    this.commands.set(command.data.name, command);
    this.commandsData.push(command.data.toJSON());
  }

  async load() {
    readdirSync("./src/commands/").forEach(async (dir) => {
      const dirCommands = readdirSync(`./src/commands/${dir}/`).filter((file) =>
        file.endsWith(".js")
      );
      for (let file of dirCommands) {
        let command = require(`../commands/${dir}/${file}`);
        try {
          command = new command();
        } catch (e) {
          console.warn("[WARN] No se ha podido cargar el comando " + file);
          continue;
        }

        if (!(command instanceof Command)) {
          continue;
        }

        if (!command.data.name) {
          continue;
        }

        await this.register(command);
        console.log(`[INFO] Successfully loaded command ${command.data.name}`);
      }
    });
  }

  async deploy() {
    try {
      await this.rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: this.commandsData }
      );
    } catch (e) {
      console.log(
        "[ERROR] Ha ocurrido un error intentando registrar un comando"
      );
      throw e;
    }
  }
};
