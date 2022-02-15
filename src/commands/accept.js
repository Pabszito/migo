const { Interaction } = require('discord.js');
const Command  = require('../struct/command');
const ReportSchema = require('../schema/report');

module.exports = class AcceptCommand extends Command {

    constructor() {
        super();
        this.data = {
            name: 'accept',
            description: 'Aprueba un reporte.',
            options: [
                {
                    type: 4,
                    name: 'id',
                    description: 'El identificador del reporte que deseas aceptar.',
                    required: true
                },
                {
                    type: 3,
                    name: 'response',
                    description: 'Una respuesta opcional para el usuario que realizó el reporte.',
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
        const response = interaction.options.getString("response");

        if(!member.permissions.has("KICK_MEMBERS")) { // TODO: add permission to slash command directly
            return interaction.reply({
                content: client.language.general.no_permissions,
                ephemeral: true
            });
        }

        let channel = client.channels.cache.get(client.config.channels.reports);

        ReportSchema.findOne({
            id: id
        }, async(err, res) => {
            if(err) return interaction.reply({
                content: client.language.general.unknown_interaction_error,
                ephemeral: true
            });
            if(!res) return interaction.reply({
                content: client.language.report.accept.report_not_found,
                ephemeral: true
            });

            await channel.messages.fetch(res.messageId).then((message) => {
                message.delete();
            });

            let author = await client.users.fetch(res.author);
            let reportedMember = await client.users.fetch(res.reportedMember);

            let embed = {
                title: client.language.report.accept.embed.title,
                description: client.language.report.accept.embed.description.replace("%staff%", member.user.tag),
                timestamp: Date.now(),
                fields: [
                    {
                        name: client.language.report.accept.embed.fields.reporter,
                        value: `${author.tag} (ID: ${author.id})`,
                        inline: false
                    },
                    { 
                        name: client.language.report.accept.embed.fields.reported,
                        value: `${reportedMember.tag} (ID: ${reportedMember.id})`,
                        inline: false
                    },
                    { 
                        name: client.language.report.accept.embed.fields.reason,
                        value: res.reason,
                        inline: false 
                    },
                    { 
                        name: client.language.report.accept.embed.fields.response,
                        value: response 
                            ? response 
                            : client.language.report.accept.default_accept_reason, 
                        inline: false
                    },
                    { 
                        name: client.language.report.accept.embed.fields.files,
                        value: '\u3164',
                        inline: false 
                    }
                ],
                image: {
                    url: res.image
                },
                footer: {
                    text: "Migo • #" + res.id,
                    icon_url: client.user.displayAvatarURL()
                }
            }

            await ReportSchema.findOneAndDelete({id: id});

            let logs = client.channels.cache.get(client.config.channels.reportsLogs);

            logs.send({embeds: [embed]});

            return interaction.reply({
                content: client.language.report.accept.report_accepted.replace("%id%", id),
                ephemeral: true
            });
        });
    }
}