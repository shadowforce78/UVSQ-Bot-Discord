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
        const commandsList = client.collection.application_commands.map((cmd) => {
            return `\`/${cmd.command.name}\` - ${cmd.command.description}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription(commandsList)
            .setColor(0x00AE86);

        await interaction.reply({
            embeds: [embed]
        });
    }
}).toJSON();