const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const fs = require("fs");
const { getCalendar, getEvent } = require("../../EDTfunction/getCalendar.js");
const { generateImage } = require("../../EDTFunction/generateImage.js");
const classeDB = require('../../../db.json')

module.exports = new ApplicationCommand({
    command: {
        name: 'edt',
        description: 'Affiche l\'emploi du temps sur une période donnée.',
        type: 1,
        options: [
            {
                name: "startdate",
                description: "Date de début de l'emploi du temps (format : YYYY-MM-DD)",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: false,
            },
            {
                name: "enddate",
                description: "Date de fin de l'emploi du temps (format : YYYY-MM-DD)",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: false,
            },
        ],
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
        let startDate = interaction.options.getString("startdate");
        let endDate = interaction.options.getString("enddate");

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

        // Function to adjust weekend dates
        function adjustWeekendDate(dateStr, isStartDate) {
            const date = new Date(dateStr);
            const day = date.getDay(); // 0 is Sunday, 6 is Saturday

            if (day === 0 || day === 6) { // Weekend
                let adjustedDate = new Date(date);
                if (isStartDate) {
                    // If it's a start date, move to next Monday
                    if (day === 0) adjustedDate.setDate(date.getDate() + 1); // Sunday -> Monday
                    if (day === 6) adjustedDate.setDate(date.getDate() + 2); // Saturday -> Monday
                } else {
                    // If it's an end date, move to previous Friday
                    if (day === 0) adjustedDate.setDate(date.getDate() - 2); // Sunday -> Friday
                    if (day === 6) adjustedDate.setDate(date.getDate() - 1); // Saturday -> Friday
                }
                return adjustedDate.toISOString().split('T')[0];
            }
            return dateStr;
        }

        // Adjust dates if they fall on weekends
        const adjustedStartDate = adjustWeekendDate(startDate, true);
        const adjustedEndDate = adjustWeekendDate(endDate, false);

        if (startDate !== adjustedStartDate || endDate !== adjustedEndDate) {
            const message = "Note: Les dates ont été ajustées pour exclure les weekends:\n" +
                (startDate !== adjustedStartDate ? `Date de début ajustée: ${startDate} → ${adjustedStartDate}\n` : "") +
                (endDate !== adjustedEndDate ? `Date de fin ajustée: ${endDate} → ${adjustedEndDate}` : "");
        }

        startDate = adjustedStartDate;
        endDate = adjustedEndDate;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Si la date de fin est avant la date de début, on refuse la requête
        if (end < start) {
            return interaction.reply(
                "La date de fin ne peut pas être avant la date de début."
            );
        }

        // Si plus de 4 jours sont demandés, on refuse la requête
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 4) {
            return interaction.reply(
                "La durée de l'emploi du temps ne peut pas dépasser 4 jours."
            );
        }

        function formatDateForFileName(dateStr) {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }

        const classe = userDB.classe;

        try {
            const calendarRes = await getCalendar(startDate, endDate, classe);
            const eventDetails = await Promise.all(
                calendarRes.map((event) => getEvent(event.id))
            );
            const eventDetailsArray = Object.values(eventDetails);

            if (eventDetailsArray.length === 0) {
                return interaction.reply({
                    content: "Aucun cours trouvé pour cette période.",
                    ephemeral: true,
                });
            }

            const startDateFormatted = formatDateForFileName(startDate);
            const endDateFormatted = formatDateForFileName(endDate);
            const fileName = `./src/EDTsaves/${classe}-${startDateFormatted}-${endDateFormatted}-image.png`;

            if (fs.existsSync(fileName)) {
            } else {
                await generateImage(classe, eventDetailsArray);
            }

            // Bouton d'interaction pour changer de jour
            // const row = {
            //     type: "ACTION_ROW",
            //     components: [
            //         {
            //             type: "BUTTON",
            //             label: "Jour précédent",
            //             style: "PRIMARY",
            //             customId: `previous`,
            //         },
            //         {
            //             type: "BUTTON",
            //             label: "Jour suivant",
            //             style: "PRIMARY",
            //             customId: `next`,
            //         },
            //     ],
            // };

            
            // Ajouter les données de lastRequest a la db

            const nbDeJour = diffDays + 1;
            classeDB[user].lastRequest = [nbDeJour, startDate];
            fs.writeFileSync("./db.json", JSON.stringify(classeDB, null, 4));

            interaction.reply({
                content: "Voici votre emploi du temps pour la période demandée :",
                files: [fileName],
                // components: [row],
            });
        } catch (err) {
            console.error(err);
            interaction.reply({
                content: "Erreur lors de la récupération du calendrier.",
                ephemeral: true,
            });
        }
    }
}).toJSON();