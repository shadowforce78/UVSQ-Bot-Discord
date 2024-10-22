const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

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

    // Créer un canvas avec une hauteur dynamique
    const width = 1200;
    let height = 800 + Object.keys(coursParJour).length * 150; // Hauteur dynamique en fonction des jours
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Couleurs de fond
    ctx.fillStyle = '#ffffff'; // Blanc
    ctx.fillRect(0, 0, width, height);

    // Titre
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#333333'; // Couleur du texte
    ctx.textAlign = 'center';
    ctx.fillText(`Emploi du temps de la classe ${classe}`, width / 2, 50);

    let currentY = 100; // Point de départ vertical

    // Définir les couleurs pour chaque type d'événement
    const eventColors = {
        TP: 'rgb(128, 0, 255)',        // Violet pour TP
        TD: 'rgb(0, 255, 0)',          // Vert pour TD
        CM: 'rgb(255, 128, 128)',      // Rouge clair pour CM
        SAE: 'rgb(128, 128, 128)',     // Gris pour Projet en autonomie
        INT: 'rgb(255, 255, 0)',       // Jaune pour Integration
        REUNION: '#D7E1FF',            // Bleu clair pour Réunion
        projetutore: 'rgb(255, 0, 128)', // Rose pour Projet Tutore
        DS: 'rgb(255, 0, 255)',        // Violet pour DS
        Divers: 'rgb(128, 255, 255)',  // Bleu cyan pour Divers
    };

    Object.keys(coursParJour).forEach((date) => {
        // Dessiner la box du jour
        ctx.fillStyle = '#f1f1f1'; // Couleur de fond de la box du jour
        ctx.fillRect(50, currentY, width - 100, 100);

        // Dessiner le titre du jour (heures uniquement)
        const dayTitle = `Cours du jour (${Object.keys(coursParJour[date])[0].substring(0, 10)})`; // Titre simplifié
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#000000'; // Noir
        ctx.fillText(dayTitle, width / 2, currentY + 40);

        // Avancer verticalement pour éviter chevauchement
        currentY += 60;

        // Ajouter les headers (Heure, Matière, Professeur, Salle, Type)
        const headers = ['Heure', 'Matière', 'Professeur', 'Salle', 'Type'];
        const columnWidth = (width - 150) / headers.length;

        headers.forEach((header, index) => {
            ctx.fillStyle = '#dddddd'; // Fond gris clair pour les headers
            ctx.fillRect(50 + index * columnWidth, currentY, columnWidth, 40);

            ctx.fillStyle = '#000000'; // Texte en noir
            ctx.font = 'bold 14px Arial';
            ctx.fillText(header, 60 + index * columnWidth, currentY + 25);
        });

        // Avancer après les headers
        currentY += 50;

        Object.keys(coursParJour[date]).forEach((courseKey) => {
            const cours = Array.isArray(coursParJour[date][courseKey])
                ? coursParJour[date][courseKey]
                : [coursParJour[date][courseKey]];

            cours.forEach((coursDetail) => {
                // Box du cours
                ctx.fillStyle = '#f9f9f9'; // Couleur de fond des cours
                ctx.fillRect(50, currentY, width - 100, 80);

                // Déterminer la couleur en fonction du type de cours
                const eventCategory = coursDetail['Event category'] || 'N/A';
                let eventColor = '#FFFFFF'; // Couleur par défaut (blanc)
                if (eventCategory.includes('TP')) {
                    eventColor = eventColors.TP;
                } else if (eventCategory.includes('TD')) {
                    eventColor = eventColors.TD;
                } else if (eventCategory.includes('CM')) {
                    eventColor = eventColors.CM;
                } else if (eventCategory.includes('Projet en autonomie')) {
                    eventColor = eventColors.SAE;
                } else if (eventCategory.includes('Integration')) {
                    eventColor = eventColors.INT;
                } else if (eventCategory.includes('Reunion')) {
                    eventColor = eventColors.REUNION;
                } else if (eventCategory.includes('projet tutore')) {
                    eventColor = eventColors.projetutore;
                } else if (eventCategory.includes('DS') || eventCategory.includes('Contrôles')) {
                    eventColor = eventColors.DS;
                } else if (eventCategory.includes('Divers')) {
                    eventColor = eventColors.Divers;
                }

                // Informations sur le cours
                const time = coursDetail.Time ? coursDetail.Time.match(/\d{2}:\d{2}-\d{2}:\d{2}/)[0].split('-') : ['N/A', 'N/A'];
                const moduleName = coursDetail.Module || 'N/A';
                const staff = coursDetail.Staff || 'N/A';
                const room = coursDetail.Room || 'N/A';

                // Afficher les informations du cours
                const courseDetails = [time, moduleName, staff, room, eventCategory];
                courseDetails.forEach((text, index) => {
                    // Délimiter chaque information
                    ctx.fillStyle = eventColor; // Couleur du type de cours
                    ctx.fillRect(50 + index * columnWidth, currentY, columnWidth, 40);

                    ctx.fillStyle = '#000000'; // Texte sur fond coloré
                    ctx.font = '14px Arial';

                    if (index === 0) {
                        // Afficher les horaires à la verticale (ajustement de la position)
                        ctx.fillText(text[0], 70 + index * columnWidth, currentY + 15); // Ajusté pour éviter le chevauchement
                        ctx.fillText(text[1], 70 + index * columnWidth, currentY + 35);
                    } else if (index === 1) {
                        // Justification automatique du nom de la matière si trop long (remonté légèrement)
                        wrapText(ctx, text, 60 + index * columnWidth, currentY + 20, columnWidth - 20, 15);
                    } else {
                        // Afficher les autres informations normalement
                        ctx.fillText(text, 60 + index * columnWidth, currentY + 25);
                    }
                });

                // Avancer verticalement pour chaque cours (ajout d'un espace supplémentaire)
                currentY += 90; // Espacement augmenté entre les cours
            });
        });

        // Espace supplémentaire entre les jours
        currentY += 50;
    });

    // Sauvegarder l'image dans un fichier
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./image.png', buffer);
}

// Fonction pour couper le texte automatiquement si trop long
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

module.exports = { generateImage };
