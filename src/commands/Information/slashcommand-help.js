const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'help',
        description: 'Replies with a list of available application commands.',
        type: 1,
        options: []
    },
    options: {
        cooldown: 10000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {



        const commandsList = [
            `/help - Reponds la liste des commandes disponibles.`,
            `/ping - Réponds avec le ping du bot.`,
            `/classe <classe> - Permet de sélectionner sa classe.`,
            `/edt <date> - Permet de consulter l'emploi du temps.`,
            `/support - Permet de contacter le support.`,
        ]

        const embed = new EmbedBuilder()
            .setTitle('Liste des commandes')
            .setDescription(commandsList.join('\n'))
            .setColor(0x00AE86);

        await interaction.reply({
            embeds: [embed]
        });
    }
}).toJSON();