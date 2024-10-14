const { Client, CommandInteraction } = require("discord.js");
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
// Fonction pour grouper les cours par jour et formater les dates
function groupCoursByDay(cours) {
    return cours.reduce((acc, cours) => {
        // Convertir la date de début du cours en format JJ/MM/AAAA
        const dateCours = new Date(cours.start).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        // Si ce jour n'existe pas encore dans l'accumulateur, l'initialiser
        if (!acc[dateCours]) {
            acc[dateCours] = [];
        }

        // Ajouter le cours dans le tableau correspondant à cette date
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
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            td, th {
                border: 1px solid #dddddd;
                text-align: center; /* Centrer le texte */
                padding: 8px; /* Agrandir un peu les cellules */
            }
            
            h2 { 
                text-align: center; 
                font-size: 18px; /* Agrandir le titre */
                margin-bottom: 15px;
            }
            
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }

            .blue { background-color: #00FF00; }
            .purple { background-color: #8000FF; }
            .red { background-color: #FF8080; }
            .yellow { background-color: #ffff00; }
            .grey { background-color: #808080; }            
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
                            <th>Salle</th>
                            <th>Type</th>
                        </tr>
                        ${coursParJour[date].map(cours => `
                            <tr>
                                <td>${cours.start.slice(11, 16)} - ${cours.end.slice(11, 16)}</td>
                                <td>${cours.title}</td>
                                <td>${cours.people}</td>
                                <td>${cours.location}</td>
                                <td class="${cours.calendarId}">${cours.eventCategory}</td>
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
        const startDate = '2024-10-14'; // Date de début
        const endDate = '2024-10-15'; // Date de fin
        const classe = "INF1-B"; // Classe à spécifier

        try {
            // Appeler la fonction getCalendar avec les valeurs dynamiques
            const calendarData = await getCalendar(startDate, endDate, classe);

            // Vérifier si des données de calendrier ont été retournées
            if (!calendarData || calendarData.length === 0) {
                return interaction.followUp({ content: "Aucun événement trouvé pour cette date.", ephemeral: true });
            }

            // Grouper les cours par jour
            const coursParJour = groupCoursByDay(calendarData);

            // Générer l'image de l'emploi du temps
            await generateImage(classe, coursParJour);

            // Envoyer un message de succès avec l'image générée
            await interaction.followUp({ content: "Image de l'emploi du temps générée avec succès !", files: ['./image.png'], ephemeral: true });

        } catch (err) {
            console.error(err); // Afficher l'erreur dans la console pour le débogage
            interaction.followUp({ content: "Erreur lors de la récupération du calendrier.", ephemeral: true });
        }
    }
};
