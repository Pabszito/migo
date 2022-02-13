const { Interaction } = require('discord.js');
const Command  = require('../struct/command');
const ReportSchema = require('../schema/report');
const fs = require('fs');

module.exports = class ReportCommand extends Command {

    constructor() {
        super();
        this.data = {
            name: 'report',
            description: 'Reporta a un usuario.',
            options: [
                {
                    type: 6,
                    name: 'usuario',
                    description: 'El usuario al que deseas reportar.',
                    required: true
                },
                {
                    type: 3,
                    name: 'razón',
                    description: 'La razón del reporte.',
                    required: true
                },
                {
                    type: 11,
                    name: 'imagen',
                    description: 'Imagen que funcione como evidencia.',
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
        const reportedUser = interaction.options.getMember("usuario").user;
        const reason = interaction.options.getString("razón");
        const image = client.attachments.get(interaction.id);

        client.attachments.delete(interaction.id);

        if (!image || !image.content_type?.includes("image")) {
            return interaction.reply({
                content: client.language.report.image_error,
                ephemeral: true
            });
        }

        let reportId = parseInt(client.config.lastReportId) + 1;
        client.config.lastReportId = reportId;

        await fs.writeFileSync("./config.json", JSON.stringify(client.config), "utf8");

        let embed = {
            author: {
                name: author.tag,
                icon_url: author.displayAvatarURL(),
            },
            title: client.language.report.embed.title,
            fields: [
                {
                    name: client.language.report.embed.fields.reporter,
                    value: `${author.tag} (ID: ${author.id})`
                },
                {
                    name: client.language.report.embed.fields.reported,
                    value: `${reportedUser.tag} (ID: ${reportedUser.id})`
                },
                {
                    name: client.language.report.embed.fields.reason,
                    value: reason
                },
                {
                    name: client.language.report.embed.fields.files,
                    value: '\u3164',
                    inline: false
                }
            ],
            image: {
                url: image.url
            },
            footer: {
                text: `Migo • #${reportId}`,
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: Date.now()
        }

        await client.channels.cache.get(client.config.channels.reports).send({embeds: [embed]}).then(async(message) => {
            const report = new ReportSchema({
                id: reportId,
                messageId: message.id,
                author: author.id,
                reportedMember: reportedUser.id,
                reason: reason,
                image: image.url
            });

            report.save();

            return interaction.reply({
                content: client.language.report.report_sent,
                ephemeral: true
            });
        }).catch(error => {
            return interaction.reply({
                content: client.language.general.unknown_interaction_error,
                ephemeral: true
            });
        });

    }
}