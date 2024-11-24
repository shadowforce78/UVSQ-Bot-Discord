const { ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'support-modal',
    type: 'modal',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ModalSubmitInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            // Récupération des valeurs du modal
            const username = interaction.user.username;
            const userClass = interaction.fields.getTextInputValue('class-field');
            const supportType = interaction.fields.getTextInputValue('support-type-field');
            const suggestion = interaction.fields.getTextInputValue('suggestion-field');

            // ID du développeur
            const devID = '918916801994309752';
            const dev = await client.users.fetch(devID);

            // Création de l'embed
            const embed = new EmbedBuilder()
                .setTitle('Support Request')
                .setDescription(`Support request from **${username}** (${interaction.user.id})`)
                .addFields(
                    { name: 'Class', value: userClass || 'Not specified', inline: true },
                    { name: 'Support Type', value: supportType || 'Not specified', inline: true },
                    { name: 'Suggestion', value: suggestion || 'No suggestion provided', inline: false }
                )
                .setColor('#fff000')
                .setTimestamp();

            // Envoi de l'embed au développeur
            await dev.send({ embeds: [embed] });

            // Confirmation à l'utilisateur
            await interaction.reply({
                content: '✅ Your support request has been sent successfully!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);

            // Gestion des erreurs
            await interaction.reply({
                content: '❌ There was an error processing your support request. Please try again later.',
                ephemeral: true
            });
        }
    }
}).toJSON();
