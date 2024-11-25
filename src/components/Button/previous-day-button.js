const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const Component = require("../../structure/Component.js");
const { getCalendar, getEvent } = require("../../EDTfunction/getCalendar.js");
const { generateImage } = require("../../EDTfunction/generateImage.js");
const fs = require("fs");
const classeDB = require('../../../db.json');

module.exports = new Component({
    customId: 'previous_day',
    type: 'button',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        let user = interaction.user.id;
        let userDB = classeDB[user];

        if (!userDB) {
            return interaction.reply({
                content: "Tu n'as pas défini ta classe. Utilise la commande `/classe` pour définir ta classe.",
                ephemeral: true,
            });
        }

        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        let startDate = currentDate.toISOString().split('T')[0];
        let endDate = startDate;

        const classe = userDB.classe;

        function createNavigationButtons() {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous_day')
                        .setLabel('Jour précédent')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('today')
                        .setLabel('Aujourd\'hui')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('next_day')
                        .setLabel('Jour suivant')
                        .setStyle(ButtonStyle.Primary)
                );
        }

        try {
            const events = await getCalendar(startDate, endDate, classe);
            if (events.length === 0) {
                await interaction.reply({
                    content: "Aucun événement trouvé pour cette période (Surement le weekend).",
                    ephemeral: true
                });
                return;
            }

            const eventID = [];
            events.forEach((event) => {
                eventID.push(event.id);
            });

            const eventDetailArray = [];

            for (let i = 0; i < eventID.length; i++) {
                const event = await getEvent(eventID[i]);
                eventDetailArray.push(event);
            }

            function sortCoursesByTime(courses) {
                return courses.sort((a, b) => {
                    const timeA = a.time.split('-')[0];
                    const timeB = b.time.split('-')[0];
                    const minutesA = convertTimeToMinutes(timeA);
                    const minutesB = convertTimeToMinutes(timeB);
                    return minutesA - minutesB;
                });
            }

            function convertTimeToMinutes(time) {
                const [hours, minutes] = time.split(':').map(Number);
                return hours * 60 + minutes;
            }

            const sortedCourses = sortCoursesByTime(eventDetailArray);

            const image = await generateImage(classe, sortedCourses);
            const buffer = fs.readFileSync(image);

            const row = createNavigationButtons();

            await interaction.update({
                files: [{
                    attachment: buffer,
                    name: "emploi-du-temps.png"
                }],
                components: [row]
            });

        } catch (error) {
            console.error(error);
            await interaction.reply("Une erreur est survenue lors de la récupération de l'emploi du temps.");
        }
    }
}).toJSON();