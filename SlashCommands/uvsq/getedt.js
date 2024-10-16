const { Client, CommandInteraction } = require("discord.js");
const { getCalendar } = require("../../EDTFunction/getInfo");
const { getEvent } = require("../../EDTFunction/getEvent");
const nodeHtmlToImage = require('node-html-to-image'); // Assurez-vous d'avoir installé cette bibliothèque

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
  name: "edt",
  description: "Ceci est une commande permettant de tester des choses",
  userperm: [""],
  botperm: [""],
  options: [
    {
      name: "startdate",
      description: "Date de début de l'emploi du temps (format : YYYY-MM-DD)",
      type: "STRING",
      required: true,
    },
    {
      name: "enddate",
      description: "Date de fin de l'emploi du temps (format : YYYY-MM-DD)",
      type: "STRING",
      required: true,
    },
  ],
  /**
  *
  * @param {Client} client
  * @param {CommandInteraction} interaction
  * @param {String[]} args
  */
  run: async (client, interaction, args) => {
    const startDate = interaction.options.getString("startdate");
    const endDate = interaction.options.getString("enddate");

    // Validation du format de la date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return interaction.followUp("La date doit être au format YYYY-MM-DD");
    }

    // Fonction pour vérifier si une date est valide
    function isValidDate(dateStr) {
      const date = new Date(dateStr);
      return date instanceof Date && !isNaN(date) && dateStr === date.toISOString().split('T')[0];
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return interaction.followUp("Une des dates fournies n'est pas valide. Vérifie que tu utilises un format correct et des dates existantes.");
    }
    const classe = "INF1-B"; // Classe à spécifier

    try {
      // Appeler la fonction getCalendar avec les valeurs dynamiques
      const calendarData = await getCalendar(startDate, endDate, classe);

      // Pour chaque cours, récupérer les détails avec l'ID
      for (const cours of calendarData) {
        const verifiedCourse = await getEvent(cours.id);
      }
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
