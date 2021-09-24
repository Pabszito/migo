const { Interaction } = require('discord.js');
const Command  = require('../struct/command');
const SuggestSchema = require('../schema/suggestion');

module.exports = class RejectCommand extends Command {

    constructor() {
        super();
        this.data = {
            name: 'reject',
            description: 'Deniega una sugerencia en especifico.',
            options: [
                {
                    type: 4,
                    name: 'id',
                    description: 'El identificador de la sugerencia que deseas rechazar.',
                    required: true
                },
                {
                    type: 3,
                    name: 'response',
                    description: 'Una respuesta opcional para el usuario que realizo la sugerencia.',
                    required: false
                }
            ]
        }
    }

    /**
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        const client = interaction.client;
        const member = interaction.member;

        const id = interaction.options.getInteger("id");
        let response = interaction.options.getString("response");

        if(!member.permissions.has("KICK_MEMBERS")) { // TODO: add permission to slash command directly
            return interaction.reply({
                content: client.language.general.no_permissions,
                ephemeral: true
            });
        }

        let channel = client.channels.cache.get(client.config.channels.suggestions);

        SuggestSchema.findOne({
            id: id
        }, async(err, res) => {
            if(err) return interaction.reply(client.language.general.unknown_interaction_error);
            if(!res) return interaction.reply(client.language.suggest.reject.suggestion_not_found);

            var approvals = 0;
            var rejections = 0;

            await channel.messages.fetch(res.messageId).then((message) => {
                approvals = message.reactions.cache.get("✅").count <= 1 
                    ? 0 
                    : message.reactions.cache.get("✅").count - 1;
                rejections = message.reactions.cache.get("❌").count <= 1 
                    ? 0 
                    : message.reactions.cache.get("❌").count - 1;

                if(message.hasThread) { // Delete thread only if it wasn't deleted
                    message.thread.delete();
                }
        
                message.delete();
            })
			
            

            let embed = {
                title: client.language.suggest.reject.embed.title,
                description: client.language.suggest.reject.embed.description.replace("%staff%", member.user.tag),
                timestamp: Date.now(),
                fields: [
                    {
                        name: client.language.suggest.reject.embed.fields.votes,
                        value: `:white_check_mark: - ${approvals}\n:x: - ${rejections}`,
                        inline: false
                    },
                    { 
                        name: client.language.suggest.reject.embed.fields.author,
                        value: res.author,
                        inline: false 
                    },
                    { 
                        name: client.language.suggest.reject.embed.fields.suggestion,
                        value: res.content,
                        inline: false 
                    },
                    { 
                        name: client.language.suggest.reject.embed.fields.response,
                        value: response 
                            ? response 
                            : client.language.suggest.reject.default_rejection_reason, 
                        inline: false
                    }
                ],
                footer: {
                    text: client.user.username,
                    icon_url: client.user.displayAvatarURL()
                }
            }

            SuggestSchema.findOneAndDelete({ 
                id: id 
            });

            let logs = client.channels.cache.get(client.config.channels.suggestionsLogs);

            logs.send({
                embeds: [
                    embed
                ]
            });

            return interaction.reply({
                content: client.language.suggest.reject.suggestion_rejected.replace("%id%", id),
                ephemeral: true
            });
        });
    }
}