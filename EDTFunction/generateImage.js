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

    // console.log("Data after merging:", coursParJour); // Debug merged data

    const html = `
    <html>
    <head>
        <style>
                        body {
                font-family: Arial, sans-serif;
            }
            .container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                justify-items: center;
                margin: 20px;
            }
            .day-container {
                margin: 10px;
                padding: 20px;
                border: 1px solid #dddddd;
                border-radius: 10px;
                width: 100%;
                box-sizing: border-box;
                height: auto;
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
            .event-category-TP {
                background-color: rgb(128 0 255);
            }
            .event-category-TD {
                background-color: rgb(0 255 0);
            }
            .event-category-CM {
                background-color: rgb(255 128 128);
            }
            .event-category-SAE {
                background-color: rgb(128 128 128);
            }
            .event-category-INT {
                background-color: rgb(255 255 0);
            }
            .event-category-REUNION {
                background-color: #D7E1FF;
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
                                        ? coursDetail.Time.match(/\d{2}:\d{2}-\d{2}:\d{2}/)[0] // Extract hh:mm-hh:mm
                                        : "N/A";
                                    const moduleName = coursDetail.Module || "N/A";
                                    const staff = coursDetail.Staff || "N/A";
                                    const room = coursDetail.Room || "N/A";
                                    const eventCategory =
                                        coursDetail["Event category"] || "N/A";

                                    let eventCategoryClass = "";
                                    if (eventCategory.includes("TP")) {
                                        eventCategoryClass = "event-category-TP";
                                    } else if (eventCategory.includes("TD")) {
                                        eventCategoryClass = "event-category-TD";
                                    } else if (eventCategory.includes("CM")) {
                                        eventCategoryClass = "event-category-CM";
                                    } else if (eventCategory.includes("Projet en autonomie")) {
                                        eventCategoryClass = "event-category-SAE";
                                    } else if (eventCategory.includes("Integration")) {
                                        eventCategoryClass = "event-category-INT";
                                    } else if (eventCategory.includes("Reunion")) {
                                        eventCategoryClass = "event-category-REUNION";
                                    }

                                    return `
                                    <tr>
                                        <td>${time}</td>
                                        <td>${moduleName}</td>
                                        <td>${staff}</td>
                                        <td>${room}</td>
                                        <td class="${eventCategoryClass}">${eventCategory}</td>
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

    return nodeHtmlToImage({ output: "./image.png", html });
}

module.exports = { generateImage };
