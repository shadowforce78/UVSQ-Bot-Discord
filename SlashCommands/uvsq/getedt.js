const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const schemaClasse = require("../../schema/classe");
const axios = require("axios");
const nodeHtmlToImage = require("node-html-to-image");

module.exports = {
  name: "edt",
  description: "Permet de définir la classe de l'utilisateur",
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


    const classe = "INF1-B"; // À remplacer avec les données utilisateur plus tard
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";

    // Préparation des headers pour la requête
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
    };

    // Construction des données de la requête POST
    const postData = `start=${startDate}&end=${endDate}&resType=103&calView=agendaWeek&federationIds%5B%5D=${classe}&colourScheme=3`;

    try {
      const response = await axios.post(url, postData, { headers });
      const events = response.data;

      // Gestion des cours
      const cours = events.map(event => ({
        nomCours: event.eventCategory || "Pas d'info",
        batimentCours: event.sites ? event.sites[0] : "Pas d'info",
        nomProf: event.description.split("<br />")[0] ? event.description.split("<br />")[0].trim() : "Pas d'info",
        salleCours: event.description.split("<br />")[2] ? event.description.split("<br />")[2].trim() : "Pas d'info",
        nomMatiere: event.description.split("<br />")[3] ? event.description.split("<br />")[3].trim() : "Pas d'info",
        dateDebut: event.start || "Pas d'info",
        dateFin: event.end || "Pas d'info",
        typeCours: determineTypeCours(event.eventCategory) || "autre",
      }));

      // Tri des cours par date de début
      const coursSorted = cours.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));

      // Groupement des cours par jour
      const coursParJour = groupCoursByDay(coursSorted);

      // Génération de l'image
      await generateImage(classe, coursParJour);

      interaction.followUp({ files: ["./image.png"] });

    } catch (error) {
      console.error(error);
      interaction.followUp("Erreur lors de la récupération des données.");
    }
  },
};

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
    const dateCours = new Date(cours.dateDebut).toLocaleDateString("fr-FR");
    if (!acc[dateCours]) acc[dateCours] = [];
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
                                <td>${new Date(cours.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(cours.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                                <td>${cours.nomMatiere}</td>
                                <td>${cours.nomProf}</td>
                                <td>${cours.batimentCours}</td>
                                <td>${cours.salleCours}</td>
                                <td class="${cours.typeCours}">${cours.typeCours.toUpperCase()}</td>
                            </tr>`).join('')}
                    </table>
                </div>`).join('')}
        </div>
    </body>
    </html>
  `;

  return nodeHtmlToImage({ output: './image.png', html });
}
