const { Client, CommandInteraction } = require("discord.js");
const { getCalendar } = require("../../EDTFunction/getCalendar");
const nodeHtmlToImage = require("node-html-to-image");

// Fonction pour grouper les cours par jour
function groupCoursByDay(cours) {
    return cours.reduce((acc, cours) => {
        const dateCours = new Date(cours.start).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        if (!acc[dateCours]) {
            acc[dateCours] = [];
        }

        acc[dateCours].push(cours);
        return acc;
    }, {});
}

// Fonction pour générer l'image de l'emploi du temps
async function generateImage(classe, coursParJour) {
    const html = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .container {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
            }
            .day-container {
                flex: 1;
                margin: 10px;
                padding: 10px;
                border: 1px solid #dddddd;
                border-radius: 10px;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 12px;
            }
            td, th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 4px;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            h2 {
                text-align: center;
                font-size: 18px;
                margin-bottom: 10px;
                color: #333;
            }
        </style>
    </head>
    <body>
        <h1 style="text-align: center;">Emploi du temps de la classe ${classe}</h1>
        <div class="container">
            ${Object.keys(coursParJour)
            .map(
                (date) => `
                <div class="day-container">
                    <h2>${date}</h2>
                    <table>
                        <tr>
                            <th>Heure</th>
                            <th>Matière</th>
                            <th>Professeur</th>
                            <th>Salle</th>
                            <th>Type</th>
                        </tr>
                        ${coursParJour[date]
                        .map((cours) => {
                            const time = new Date(cours.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const moduleName = cours.modules ? cours.modules[0] : "N/A";
                            const staff = cours.description.split('\r\n')[0] || "N/A"; // Récupère le nom du professeur à partir de la description
                            const room = cours.sites ? cours.sites[0] : "N/A"; // Prend la première salle
                            const eventCategory = cours.eventCategory || "N/A";

                            return `
                                <tr>
                                    <td>${time}</td>
                                    <td>${moduleName}</td>
                                    <td>${staff}</td>
                                    <td>${room}</td>
                                    <td>${eventCategory}</td>
                                </tr>
                            `;
                        })
                        .join("")}
                    </table>
                </div>`
            )
            .join("")}
        </div>
    </body>
    </html>
    `;

    return nodeHtmlToImage({ output: "./image.png", html });
}

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
        const endDate = "2024-10-14"; // Date de fin
        const classe = "INF1-B"; // Classe à spécifier

        try {
            // Appeler la fonction getCalendar avec les valeurs dynamiques
            const calendarData = await getCalendar(startDate, endDate, classe);

            // Vérifier si des données de calendrier ont été retournées
            if (!calendarData || calendarData.length === 0) {
                return interaction.followUp({
                    content: "Aucun événement trouvé pour cette date.",
                    ephemeral: true,
                });
            }

            // Regrouper les cours par jour
            const coursParJour = groupCoursByDay(calendarData);

            // Générer l'image
            await generateImage(classe, coursParJour);

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
