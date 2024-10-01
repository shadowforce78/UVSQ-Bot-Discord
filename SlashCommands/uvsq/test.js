const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { getCalendar } = require("../../EDTFunction/getInfo");
const nodeHtmlToImage = require('node-html-to-image'); // Assurez-vous d'avoir installé cette bibliothèque

// Fonction pour déterminer le type de cours
function determineTypeCours(nomCours) {
    if (nomCours.includes("CM")) return "cm";
    if (nomCours.includes("TD")) return "td";
    if (nomCours.includes("TP")) return "tp";
    if (nomCours.includes('DS')) return "ds";
    if (nomCours.includes('Projet en autonomie')) return "sae";
    if (nomCours.includes('Integration')) return "int";
    return "autre";
}

// Fonction pour grouper les cours par jour
function groupCoursByDay(cours) {
    return cours.reduce((acc, cours) => {
        const dateCours = new Date(cours.start).toLocaleDateString("fr-FR");
        if (!acc[dateCours]) acc[dateCours] = [];
        acc[dateCours].push(cours);
        return acc;
    }, {});
}

// Fonction pour générer l'image de l'emploi du temps
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
            .cm { background-color: #FF8080; }
            .td { background-color: #00FF00; }
            .tp { background-color: #8000FF; }
            .ds { background-color: #ff00ff; }
            .sae { background-color: #c0c0c0; }
            .int { background-color: #ffff00; }
            h2 { text-align: center; font-size: 16px; margin: 0 0 10px 0; }
        </style>
    </head>
    <body>
        <h1 style="text-align: center;">Emploi du temps de la classe ${classe}</h1>
        <div class="container">
            ${Object.keys(coursParJour).map(date => `
                <div class="day-container">
                    <h2>${date}</h2>
                    <table>
                        <tr>
                            <th>Heure</th>
                            <th>Matière</th>
                            <th>Professeur</th>
                            <th>Bâtiment</th>
                            <th>Salle</th>
                            <th>Type</th>
                        </tr>
                        ${coursParJour[date].map(cours => `
                            <tr>
                                <td>${new Date(cours.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(cours.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                                <td>${cours.title}</td>
                                <td>${cours.description.split('<br />')[0]}</td> <!-- Pour obtenir le nom du professeur -->
                                <td>${(cours.sites && Array.isArray(cours.sites)) ? cours.sites.join(', ') : 'N/A'}</td> <!-- Vérification pour le bâtiment -->
                                <td>${(cours.modules && Array.isArray(cours.modules)) ? cours.modules.join(', ') : 'N/A'}</td> <!-- Vérification pour la salle -->
                                <td class="${determineTypeCours(cours.title)}">${determineTypeCours(cours.title).toUpperCase()}</td>
                            </tr>`).join('')}
                    </table>
                </div>`).join('')}
        </div>
    </body>
    </html>
    `;

    return nodeHtmlToImage({ output: './image.png', html });
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
        const startDate = '2024-10-02'; // Date de début
        const endDate = '2024-10-02'; // Date de fin
        const classe = "INF1-B"; // Classe à spécifier

        try {
            // Appeler la fonction getCalendar avec les valeurs dynamiques
            const calendarData = await getCalendar(startDate, endDate, classe);

            // Vérifier si des données de calendrier ont été retournées
            if (!calendarData || calendarData.length === 0) {
                return interaction.followUp({ content: "Aucun événement trouvé pour cette date.", ephemeral: true });
            }

            // Trier les cours par date de début
            const coursSorted = calendarData.sort((a, b) => new Date(a.start) - new Date(b.start));

            // Grouper les cours par jour
            const coursParJour = groupCoursByDay(coursSorted);

            // Générer l'image de l'emploi du temps
            await generateImage(classe, coursParJour);

            // Envoyer un message de succès
            interaction.followUp({ content: "Image de l'emploi du temps générée avec succès !", ephemeral: true });

        } catch (err) {
            console.error(err); // Afficher l'erreur dans la console pour le débogage
            interaction.followUp({ content: "Erreur lors de la récupération du calendrier.", ephemeral: true });
        }
    }
};
