const { ChatInputCommandInteraction, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const fs = require("fs");
const { getCalendar, getEvent } = require("../../EDTfunction/getCalendar.js");
const { generateImage } = require("../../EDTfunction/generateImage.js");
const classeDB = require('../../../db.json')

module.exports = new ApplicationCommand({
    command: {
        name: 'test',
        description: '[TESTING COMMAND] Commande de test.',
        type: 1,
    },
    options: {
        cooldown: 5000,
        botDevelopers: true
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        let startDate = "2024-11-25"
        let endDate = startDate;

        let user = interaction.user.id;
        let userDB = classeDB[user];



        // Si l'utilisateur n'a pas de classe
        if (!userDB) {
            return interaction.reply({
                content:
                    "Tu n'as pas défini ta classe. Utilise la commande `/classe` pour définir ta classe.",
                ephemeral: true,
            });
        }

        // Validation du format de la date
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
        ) {
            return interaction.reply("La date doit être au format YYYY-MM-DD");
        }

        // Fonction pour vérifier si une date est valide
        function isValidDate(dateStr) {
            const date = new Date(dateStr);
            return (
                date instanceof Date &&
                !isNaN(date) &&
                dateStr === date.toISOString().split("T")[0]
            );
        }

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return interaction.reply(
                "Une des dates fournies n'est pas valide. Vérifie que tu utilises un format correct et des dates existantes."
            );
        }

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
                await interaction.reply("Aucun événement trouvé pour cette période.");
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
                    // Extraire les heures de début des deux cours
                    const timeA = a.time.split('-')[0]; // Exemple : '08:30'
                    const timeB = b.time.split('-')[0]; // Exemple : '10:30'

                    // Convertir les heures en minutes totales
                    const minutesA = convertTimeToMinutes(timeA);
                    const minutesB = convertTimeToMinutes(timeB);

                    // Comparer les minutes totales pour le tri
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

            // Update lastRequest
            userDB.lastRequest = startDate;
            fs.writeFileSync('./db.json', JSON.stringify(classeDB, null, 2));

            await interaction.reply({
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