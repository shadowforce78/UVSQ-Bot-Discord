const { Client, CommandInteraction } = require("discord.js");
const { getCalendar, getEvent } = require("../../EDTFunction/getCalendar");
const { generateImage } = require("../../EDTFunction/generateImage.js");
const fs = require("fs");
const classeDB = require("../../db.json");

module.exports = {
    name: "test",
    description: "Commande permettant de générer l'emploi du temps",
    userperm: [""],
    botperm: [""],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        let startDate = "2024-10-24"
        let endDate = "2024-10-24"

        let user = interaction.user.id;
        let userDB = classeDB[user];

        // Si l'utilisateur n'a pas de classe
        if (!userDB) {
            return interaction.followUp({
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
            return interaction.followUp("La date doit être au format YYYY-MM-DD");
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
            return interaction.followUp(
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
            return interaction.followUp(
                "La date de fin ne peut pas être avant la date de début."
            );
        }

        // Si plus de 4 jours sont demandés, on refuse la requête
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 4) {
            return interaction.followUp(
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
                return interaction.followUp({
                    content: "Aucun cours trouvé pour cette période.",
                    ephemeral: true,
                });
            }

            const startDateFormatted = formatDateForFileName(startDate);
            const endDateFormatted = formatDateForFileName(endDate);
            const fileName = `./EDTsaves/${classe}-${startDateFormatted}-${endDateFormatted}-image.png`;

            if (fs.existsSync(fileName)) {
            } else {
                await generateImage(classe, eventDetailsArray);
            }

            // Bouton d'interaction pour changer de jour
            const row = {
                type: "ACTION_ROW",
                components: [
                    {
                        type: "BUTTON",
                        label: "Jour précédent",
                        style: "PRIMARY",
                        customId: `previous`,
                    },
                    {
                        type: "BUTTON",
                        label: "Jour suivant",
                        style: "PRIMARY",
                        customId: `next`,
                    },
                ],
            };

            
            // Ajouter les données de lastRequest a la db

            const nbDeJour = diffDays + 1;
            classeDB[user].lastRequest = [nbDeJour, startDate];
            fs.writeFileSync("./db.json", JSON.stringify(classeDB, null, 4));

            interaction.followUp({
                content: "Voici votre emploi du temps pour la période demandée :",
                files: [fileName],
                components: [row],
            });
        } catch (err) {
            console.error(err);
            interaction.followUp({
                content: "Erreur lors de la récupération du calendrier.",
                ephemeral: true,
            });
        }
    },
};