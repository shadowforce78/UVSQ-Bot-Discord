const { Client, CommandInteraction } = require("discord.js");
const { getCalendar, getEvent } = require("../../EDTFunction/getCalendar");
const { generateImage } = require('../../EDTFunction/generateImage');

module.exports = {
    name: "test",
    description: "Ceci est une commande permettant de tester des choses",

    userperm: [""],
    botperm: [""],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const startDate = "2024-10-14"; // Date de début
        const endDate = "2024-10-19"; // Date de fin
        const classe = "INF1-B"; // Classe à spécifier

        try {
            // Appeler la fonction getCalendar avec les valeurs dynamiques
            const calendarRes = await getCalendar(startDate, endDate, classe);

            // Map calendarRes to get the event details
            const eventDetails = await Promise.all(
                calendarRes.map((event) => getEvent(event.id))
            );

            const eventDetailsArray = Object.values(eventDetails);

            // eventDetailsArray.forEach(dayObject => {
            //     // Récupérer la date (clé principale)
            //     const date = Object.keys(dayObject)[0];

            //     // Récupérer les cours pour cette date
            //     const courses = dayObject[date];


            //     // Itérer sur les cours et afficher le contenu de l'array
            //     Object.keys(courses).forEach(course => {
            //         const courseDetails = courses[course]; // Récupérer l'array
            //         console.log(`Cours : ${course}`);

            //         // Afficher chaque élément de l'array (détails du cours)
            //         courseDetails.forEach(detail => {
            //             console.log(`  - Time : ${detail['Time'] || 'N/A'}`);
            //             console.log(`  - Module : ${detail['Module'] || 'N/A'}`);
            //             console.log(`  - Prof : ${detail['Staff'] || 'N/A'}`);
            //             console.log(`  - Room : ${detail['Room'] || 'N/A'}`);
            //             console.log(`  - Event Category : ${detail['Event category'] || 'N/A'}`);
            //         });
            //     });
            // });

            // Générer l'image
            await generateImage(classe, eventDetailsArray);

            // Répondre à l'utilisateur avec un message de confirmation
            interaction.followUp({
                content: "L'image de l'emploi du temps a été générée avec succès !",
                files: ["./image.png"],
                ephemeral: true,
            });
        } catch (err) {
            console.error(err); // Afficher l'erreur dans la console pour le débogage
            interaction.followUp({
                content: "Erreur lors de la récupération du calendrier.",
                ephemeral: true,
            });
        }
    },
};
