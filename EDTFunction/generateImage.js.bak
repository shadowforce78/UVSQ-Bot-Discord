const nodeHtmlToImage = require("node-html-to-image");

// Fonction pour générer l'image de l'emploi du temps
async function generateImage(classe, coursParJourArray) {
    // Fusionner les objets du tableau en un seul objet
    const coursParJour = coursParJourArray.reduce((acc, curr) => {
        const dateKey = Object.keys(curr)[0];
        if (!acc[dateKey]) {
            acc[dateKey] = {};
        }
        Object.assign(acc[dateKey], curr[dateKey]);
        return acc;
    }, {});
    
    const html = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Grille responsive */
                gap: 20px;
                margin: 20px;
                padding: 10px;
            }
            .day-container {
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 10px;
                background-color: #f9f9f9;
                box-sizing: border-box;
                width: 100%;
                max-width: 100%; /* Limiter la largeur */
                overflow: hidden; /* Empêcher le débordement */
                word-wrap: break-word; /* Gérer les longs textes */
            }
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 14px;
            }
            td, th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 6px;
                box-sizing: border-box;
            }
            th {
                background-color: #f1f1f1;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            h2 {
                text-align: center;
                font-size: 20px;
                margin-bottom: 10px;
                color: #333;
                overflow: hidden; /* Limiter le débordement du titre */
            }
            /* Couleurs pour les catégories d'événements */
            .event-category-TP {
                background-color: rgb(128, 0, 255);
            }
            .event-category-TD {
                background-color: rgb(0, 255, 0);
            }
            .event-category-CM {
                background-color: rgb(255, 128, 128);
            }
            .event-category-SAE {
                background-color: rgb(128, 128, 128);
            }
            .event-category-INT {
                background-color: rgb(255, 255, 0);
            }
            .event-category-REUNION {
                background-color: #D7E1FF;
            }
            .event-category-projetutore {
                background-color: rgb(255, 0, 128);
            }
            .event-category-divers {
                background-color: rgb(128, 255, 255);
            }
            .event-category-DS {
                background-color: rgb(255, 0, 255);
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
                            ${Object.keys(coursParJour[date])
                        .map((courseKey) => {
                            const cours = Array.isArray(
                                coursParJour[date][courseKey]
                            )
                                ? coursParJour[date][courseKey]
                                : [coursParJour[date][courseKey]];

                            return cours
                                .map((coursDetail) => {
                                    const time = coursDetail.Time
                                        ? coursDetail.Time.match(/\d{2}:\d{2}-\d{2}:\d{2}/)[0]
                                        : "N/A";
                                    const moduleName = coursDetail.Module || "N/A";
                                    const staff = coursDetail.Staff || "N/A";
                                    const room = coursDetail.Room || "N/A";
                                    const eventCategory = coursDetail["Event category"] || "N/A";

                                    let eventCategoryClass = "";
                                    let eventCategoryType = "";
                                    if (eventCategory.includes("TP")) {
                                        eventCategoryClass = "event-category-TP";
                                        eventCategoryType = "TP";
                                    } else if (eventCategory.includes("TD")) {
                                        eventCategoryClass = "event-category-TD";
                                        eventCategoryType = "TD";
                                    } else if (eventCategory.includes("CM")) {
                                        eventCategoryClass = "event-category-CM";
                                        eventCategoryType = "CM";
                                    } else if (eventCategory.includes("Projet en autonomie")) {
                                        eventCategoryClass = "event-category-SAE";
                                        eventCategoryType = "SAE";
                                    } else if (eventCategory.includes("Integration")) {
                                        eventCategoryClass = "event-category-INT";
                                        eventCategoryType = "INT";
                                    } else if (eventCategory.includes("Reunion")) {
                                        eventCategoryClass = "event-category-REUNION";
                                        eventCategoryType = "Réunion";
                                    } else if (eventCategory.includes("projet tutore")) {
                                        eventCategoryClass = "event-category-projetutore";
                                        eventCategoryType = "SAE";
                                    } else if (eventCategory.includes("Divers")) {
                                        eventCategoryClass = "event-category-divers";
                                        eventCategoryType = "Divers";
                                    } else if (eventCategory.includes("DS") || eventCategory.includes("Contrôles")) {
                                        eventCategoryClass = "event-category-DS";
                                        eventCategoryType = "DS";
                                    }

                                    return `
                                            <tr>
                                                <td>${time}</td>
                                                <td>${moduleName}</td>
                                                <td>${staff}</td>
                                                <td>${room}</td>
                                                <td class="${eventCategoryClass}">${eventCategoryType}</td>
                                            </tr>
                                        `;
                                })
                                .join("");
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




    const options = {
        output: './image.png',
        html: html,
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    };


    return nodeHtmlToImage(options);
}

module.exports = { generateImage };
