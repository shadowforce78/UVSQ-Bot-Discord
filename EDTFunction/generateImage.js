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
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .day-container {
                margin: 10px;
                padding: 10px;
                border: 1px solid #dddddd;
                border-radius: 10px;
                width: 80%;
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
                        ${Object.keys(coursParJour[date])
                        .map((courseKey) => {
                            const cours = Array.isArray(coursParJour[date][courseKey])
                                ? coursParJour[date][courseKey]
                                : [coursParJour[date][courseKey]];

                            return cours
                            .map((coursDetail) => {
                                const time = coursDetail.Time || "N/A";
                                const moduleName = coursDetail.Module || "N/A";
                                const staff = coursDetail.Staff || "N/A";
                                const room = coursDetail.Room || "N/A";
                                const eventCategory = coursDetail['Event category'] || "N/A";

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
