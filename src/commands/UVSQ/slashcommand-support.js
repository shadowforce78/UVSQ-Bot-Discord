const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const fs = require("fs");
const { getCalendar, getEvent } = require("../../EDTfunction/getCalendar.js");
const { generateImage } = require("../../EDTfunction/generateImage.js");
const classeDB = require('../../../db.json')

module.exports = new ApplicationCommand({
    command: {
        name: 'support',
        description: 'Commande de support pour demander de l\'aide ou ajouter une suggestion.',
        type: 1,
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.showModal({
            custom_id: 'support-modal',
            title: 'Support',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'class-field',
                            label: 'Quelle est votre classe ?',
                            placeholder: 'e.g., INF1-B2, MMI1-A1...',
                            style: 1, // Short text input
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'support-type-field',
                            label: 'Quel type de support ?',
                            placeholder: 'e.g., Bug, Ajout...',
                            style: 1, // Short text input
                            required: true,
                        },
                    ],
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'suggestion-field',
                            label: 'Entrez votre suggestion ici',
                            placeholder: 'e.g., Ajouter une commande...',
                            style: 2, // Paragraph text input
                            required: true,
                        },
                    ],
                },
            ],
        });

    }
}).toJSON();