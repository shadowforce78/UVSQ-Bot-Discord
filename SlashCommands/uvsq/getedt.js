const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const schemaClasse = require('../../schema/classe');
const axios = require('axios');
const nodeHtmlToImage = require('node-html-to-image')

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
        }
    ],
    /**
    *
    * @param {Client} client
    * @param {CommandInteraction} interaction
    * @param {String[]} args
    */
    run: async (client, interaction, args) => {

        const classeUser = interaction.options.getString("classe");
        const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";
        const method = "POST";
        // const data = schemaClasse.findOne({ id: interaction.user.id });

        // if (!data) {
        //     return interaction.followUp('Vous n\'avez pas défini votre classe\nFaites `/classe` pour définir votre classe');
        // }

        const classe = 'INF1-B'

        const dateDebut = interaction.options.getString("startdate");
        const dateFin = interaction.options.getString("enddate");


        // Format de la date : YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDebut) || !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
            return interaction.followUp("La date doit être au format YYYY-MM-DD");
        }

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01"
        };


        const postdata = `start=${dateDebut}&end=${dateFin}&resType=103&calView=agendaWeek&federationIds%5B%5D=${classe}&colourScheme=3`;

        const response = await axios.post(url, postdata, { headers: headers });

        const events = response.data; // Pas besoin de JSON.stringify ici, data est déjà un tableau d'objets

        const cours = [];

        events.forEach(event => {
            const nomCours = event.eventCategory; // Nom du cours
            const batimentCours = event.sites[0]; // Batiment du cours (première entrée dans "sites")

            // Extraction du nom du prof depuis "description"
            const descriptionParts = event.description.split('<br />');
            const nomProf = descriptionParts[0].trim(); // Le nom du prof est avant le premier <br />
            const salleCours = descriptionParts[2].trim(); // La salle est après le premier <br />
            const nomMatiere = descriptionParts[3].trim(); // La matière est après le deuxième <br />

            // Cours Magistraux (CM)
            if (nomCours.includes("CM")) {
                var typeCours = "cm";
            } else if (nomCours.includes("TD")) {
                var typeCours = "td";
            } else if (nomCours.includes("TP")) {
                var typeCours = "tp";
            }

            const dateDebut = event.start; // Date de début du cours
            const dateFin = event.end;

            cours.push({
                nomCours,
                batimentCours,
                salleCours,
                nomProf,
                dateDebut,
                dateFin,
                typeCours,
                nomMatiere
            });
        });

        // Trier les cours par date de début
        cours.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));

        // Grouper les cours par jour
        const coursParJour = cours.reduce((acc, cours) => {
            const dateCours = new Date(cours.dateDebut).toLocaleDateString('fr-FR');
            if (!acc[dateCours]) acc[dateCours] = [];
            acc[dateCours].push(cours);
            return acc;
        }, {});

        nodeHtmlToImage({
            output: './image.png',
            html: `
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
                        font-size: 12px; /* Réduction de la taille de police pour plus de compacité */
                    }
        
                    td, th {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 4px; /* Moins de padding pour compacter */
                    }
        
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
        
                    .cm {
                        background-color: #FF8080;
                    }
        
                    .td {
                        background-color: #00FF00;
                    }
        
                    .tp {
                        background-color: #8000FF;
                    }
        
                    h2 {
                        text-align: center;
                        font-size: 16px;
                        margin: 0 0 10px 0;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">Emploi du temps de la semaine</h1>
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
                                                <td>${new Date(cours.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(cours.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td>${cours.nomMatiere}</td>
                                                <td>${cours.nomProf}</td>
                                                <td>${cours.batimentCours}</td>
                                                <td>${cours.salleCours}</td>
                                                <td class="${cours.typeCours}">${cours.typeCours.toUpperCase()}</td>
                                            </tr>
                                        `).join('')
                }
                                </table>
                            </div>
                        `).join('')
                }
                </div>
            </body>
            </html>
            `
        }).then(() => {
            interaction.followUp({ files: ['./image.png'] });
        });

    }
};