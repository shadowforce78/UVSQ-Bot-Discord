const { Client, CommandInteraction } = require("discord.js");
const { getCalendar, getEvent } = require("../../EDTFunction/getCalendar");
const nodeHtmlToImage = require("node-html-to-image");

// Fonction pour grouper les cours par jour
function groupCoursByDay(cours) {
    const groupedCourses = {};

    // Vérifie si cours est un tableau
    if (!Array.isArray(cours)) {
        console.error("Erreur : 'cours' n'est pas un tableau", cours);
        return groupedCourses; // Retourne un objet vide si ce n'est pas un tableau
    }

    // Grouper les cours par jour
    cours.forEach(course => {
        const date = course.Time.split(' ')[0]; // Supposons que Time est au format "14/10/2024 09:00-11:00"

        if (!groupedCourses[date]) {
            groupedCourses[date] = [];
        }

        groupedCourses[date].push(course);
    });

    return groupedCourses; // Retourner les cours groupés
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
            const calendarRes = await getCalendar(startDate, endDate, classe);

            // Map calendarRes to get the event details
            const eventDetails = await Promise.all(
                calendarRes.map((event) => getEvent(event.id))
            );

            const eventDetailsArray = Object.values(eventDetails);

            eventDetailsArray.forEach(dayObject => {
                // Récupérer la date (clé principale)
                const date = Object.keys(dayObject)[0];

                // Récupérer les cours pour cette date
                const courses = dayObject[date];

                console.log(`Date : ${date}`);

                // Itérer sur les cours et afficher le contenu de l'array
                Object.keys(courses).forEach(course => {
                    const courseDetails = courses[course]; // Récupérer l'array
                    console.log(`Cours : ${course}`);

                    // Afficher chaque élément de l'array (détails du cours)
                    courseDetails.forEach(detail => {
                        console.log(`  - Time : ${detail['Time'] || 'N/A'}`);
                        console.log(`  - Module : ${detail['Module'] || 'N/A'}`);
                        console.log(`  - Group : ${detail['Group'] || 'N/A'}`);
                        console.log(`  - Room : ${detail['Room'] || 'N/A'}`);
                        console.log(`  - Event Category : ${detail['Event category'] || 'N/A'}`);
                        console.log(`  - Prof : ${detail['Staff'] || 'N/A'}`);
                    });
                });
            });



            // Vérifier si des données de calendrier ont été retournées
            // if (!calendarData || calendarData.length === 0) {
            //     return interaction.followUp({
            //         content: "Aucun événement trouvé pour cette date.",
            //         ephemeral: true,
            //     });
            // }

            // Regrouper les cours par jour
            // const coursParJour = groupCoursByDay(calendarData);

            // Générer l'image
            // await generateImage(classe, coursParJour);

            // Répondre à l'utilisateur avec un message de confirmation
            interaction.followUp({
                content: "L'image de l'emploi du temps a été générée avec succès !",
                // files: ["./image.png"],
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
