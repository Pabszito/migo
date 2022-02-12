const { Interaction } = require('discord.js');
const Command  = require('../struct/command');
const SuggestSchema = require('../schema/suggestion');
const fs = require('fs');

module.exports = class SuggestCommand extends Command {

    constructor() {
        super();
        this.data = {
            name: 'suggest',
            description: 'Envia una sugerencia para ayudar a mejorar el Discord.',
            options: [
                {
                    type: 3,
                    name: 'sugerencia',
                    description: 'La sugerencia que deseas enviar.',
                    required: true
                }
            ]
        };
    }

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        const client = interaction.client;
        const member = interaction.member;
        const author = member.user;
        const option = interaction.options.getString("sugerencia");

        if(member.roles.cache.size <= 1)
            return interaction.reply(`:x: | Necesitas ser nivel 10 o superior para ejecutar ese comando!`);

        let suggestionId = parseInt(client.config.lastSuggestionId) + 1;
        client.config.lastSuggestionId = suggestionId;

        await fs.writeFileSync("./config.json", JSON.stringify(client.config), "utf8");

        let embed = {
            author: {
                name: author.username,
                icon_url: author.displayAvatarURL(),
            },
            description: client.language.suggest.embed.description,
            timestamp: Date.now(),
            fields: [
                {
                    name: client.language.suggest.embed.field,
                    value: option
                }
            ],
            footer: {
                text: `${client.user.username} • #${suggestionId}`,
                icon_url: client.user.displayAvatarURL()
            }
        }

        client.channels.cache.get(client.config.channels.suggestions).send({embeds: [embed]}).then(async(message) => {
            await message.react(`✅`);
            await message.react(`❌`);

            message.startThread({
                name: `ID ${suggestionId}`,
                autoArchiveDuration: 24 * 60,
                reason: `Automatically created for the suggestion made by ${interaction.user.tag}.`,
            });

            const suggestion = new SuggestSchema({
                id: suggestionId,
                messageId: message.id,
                author: author.tag,
                content: option
            });

            suggestion.save();
        });

        return interaction.reply({
            content: client.language.suggest.suggestion_sent,
            ephemeral: true
        });
    }
}