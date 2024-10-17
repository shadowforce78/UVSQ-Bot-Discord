const nodeHtmlToImage = require("node-html-to-image");

// Fonction pour générer l'image de l'emploi du temps
async function generateImage(classe, eventDetailsArray) {
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
            ${eventDetailsArray.map(dayObject => {
                const date = Object.keys(dayObject)[0]; // Récupère la date
                const courseObj = dayObject[date]; // Récupère l'objet contenant les modules

                // Itérer sur chaque module (clé)
                return `
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
                            ${Object.keys(courseObj).map(moduleName => {
                                const courses = courseObj[moduleName]; // Récupère le tableau des cours pour ce module

                                // Vérifier que "courses" est un tableau
                                if (!Array.isArray(courses)) {
                                    console.error(`Erreur : les cours pour le module ${moduleName} ne sont pas un tableau`, courses);
                                    return ''; // Ignorer si ce n'est pas un tableau
                                }

                                // Itérer sur chaque cours pour ce module
                                return courses.map(detail => {
                                    const time = detail['Time'] || 'N/A';
                                    const module = detail['Module'] || moduleName; // Utiliser le module comme fallback
                                    const staff = detail['Staff'] || 'N/A';
                                    const room = detail['Room'] || 'N/A';
                                    const eventCategory = detail['Event category'] || 'N/A';

                                    return `
                                        <tr>
                                            <td>${time}</td>
                                            <td>${module}</td>
                                            <td>${staff}</td>
                                            <td>${room}</td>
                                            <td>${eventCategory}</td>
                                        </tr>
                                    `;
                                }).join('');
                            }).join('')}
                        </table>
                    </div>`;
            }).join('')}
        </div>
    </body>
    </html>
    `;

    return nodeHtmlToImage({ output: "./image.png", html });
}

module.exports = { generateImage };
