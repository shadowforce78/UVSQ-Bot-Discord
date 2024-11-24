const { createCanvas } = require('canvas');
const fs = require('fs');

// Configuration constants
const CANVAS_CONFIG = {
    COLORS: {
        BACKGROUND: '#1a1a1a',
        TEXT: '#ffffff',
        ALTERNATE_ROW: '#2a2a2a',
        BORDER: '#404040',
        DAY_BACKGROUND: '#333333',
        HEADER_BACKGROUND: '#202020'
    },
    FONTS: {
        TITLE: 'bold 32px Arial',
        HEADER: 'bold 24px Arial',
        CONTENT: '18px Arial'
    },
    DIMENSIONS: {
        WIDTH: 1400,
        ROW_HEIGHT: 60,
        HEADER_HEIGHT: 100,
        PADDING: 50,
        BORDER_RADIUS: 15,
        BOTTOM_MARGIN: 50
    }
};

const EVENT_CATEGORIES = {
    TP: { color: '#9933FF', label: 'TP' },       // Violet plus sombre
    TD: { color: '#33CC33', label: 'TD' },       // Vert plus sombre
    CM: { color: '#FF6666', label: 'CM' },       // Rouge plus sombre
    SAE: { color: '#666666', label: 'SAE' },     // Gris
    INT: { color: '#CCCC00', label: 'INT' },     // Jaune plus sombre
    REUNION: { color: '#4D5873', label: 'RÉU' }, // Bleu gris
    PROJET: { color: '#CC0066', label: 'PROJ' }, // Rose plus sombre
    DIVERS: { color: '#408080', label: 'DIV' },  // Cyan plus sombre
    DS: { color: '#CC00CC', label: 'DS' }        // Magenta plus sombre
};

function getEventCategory(category) {
    const categoryMap = {
        'TP': EVENT_CATEGORIES.TP,
        'Travaux Pratiques (TP)': EVENT_CATEGORIES.TP,
        'TD': EVENT_CATEGORIES.TD,
        'Travaux Dirigés (TD)': EVENT_CATEGORIES.TD,
        'CM': EVENT_CATEGORIES.CM,
        'Cours Magistraux (CM)': EVENT_CATEGORIES.CM,
        'Projet en autonomie': EVENT_CATEGORIES.SAE,
        'Integration': EVENT_CATEGORIES.INT,
        'Reunion': EVENT_CATEGORIES.REUNION,
        'projet tutore': EVENT_CATEGORIES.PROJET,
        'Divers': EVENT_CATEGORIES.DIVERS,
        'DS': EVENT_CATEGORIES.DS,
        'Contrôles': EVENT_CATEGORIES.DS
    };

    return categoryMap[category] || { color: CANVAS_CONFIG.COLORS.BACKGROUND, label: 'N/A' };
}


function truncateText(ctx, text, maxWidth) {
    const ellipsis = '...';
    if (ctx.measureText(text).width <= maxWidth) return text;

    let left = 0;
    let right = text.length;

    while (left < right) {
        const mid = Math.ceil((left + right) / 2);
        const testText = text.slice(0, mid) + ellipsis;

        if (ctx.measureText(testText).width <= maxWidth) {
            left = mid;
        } else {
            right = mid - 1;
        }
    }

    return text.slice(0, left) + ellipsis;
}

function drawHeader(ctx, date, x, y, width) {
    const gradient = ctx.createLinearGradient(x, y, x, y + CANVAS_CONFIG.DIMENSIONS.HEADER_HEIGHT);
    gradient.addColorStop(0, CANVAS_CONFIG.COLORS.HEADER_BACKGROUND);
    gradient.addColorStop(1, '#282828');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, CANVAS_CONFIG.DIMENSIONS.HEADER_HEIGHT);

    ctx.font = CANVAS_CONFIG.FONTS.HEADER;
    ctx.fillStyle = CANVAS_CONFIG.COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(`Emploi du temps - ${date}`, x + width / 2, y + 60);
}


function drawRow(ctx, course, x, y, rowIndex, width) {
    const { DIMENSIONS, COLORS } = CANVAS_CONFIG;
    const eventCategory = getEventCategory(course['Event category']);

    // Fond de la ligne
    const gradient = ctx.createLinearGradient(x, y, x, y + DIMENSIONS.ROW_HEIGHT);
    const baseColor = rowIndex % 2 === 0 ? COLORS.BACKGROUND : COLORS.ALTERNATE_ROW;
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, adjustColor(baseColor, -10));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, DIMENSIONS.ROW_HEIGHT);

    // Bordure
    ctx.strokeStyle = COLORS.BORDER;
    ctx.strokeRect(x, y, width, DIMENSIONS.ROW_HEIGHT);

    // Distribution optimisée de l'espace
    const totalWidth = width - (2 * DIMENSIONS.PADDING);
    const fields = [
        { text: course.time || 'N/A', width: totalWidth * 0.12 },    // 12% pour l'heure
        { text: course.Module || 'N/A', width: totalWidth * 0.40 },  // 40% pour le module
        { text: course.Staff || 'N/A', width: totalWidth * 0.23 },   // 23% pour l'enseignant
        { text: course.Room || 'N/A', width: totalWidth * 0.13 },    // 13% pour la salle
        { type: 'category', width: totalWidth * 0.12 }               // 12% pour la catégorie
    ];

    let currentX = x + DIMENSIONS.PADDING;
    ctx.font = CANVAS_CONFIG.FONTS.CONTENT;
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'left';

    fields.forEach((field, index) => {
        if (field.type === 'category') {
            // Dessiner la catégorie
            const categoryWidth = field.width - 20; // Marge pour la catégorie
            const categoryX = currentX;
            const radius = 10;

            ctx.beginPath();
            ctx.moveTo(categoryX + 5 + radius, y + 5);
            ctx.lineTo(categoryX + categoryWidth - 5 - radius, y + 5);
            ctx.arcTo(categoryX + categoryWidth - 5, y + 5, categoryX + categoryWidth - 5, y + 5 + radius, radius);
            ctx.lineTo(categoryX + categoryWidth - 5, y + DIMENSIONS.ROW_HEIGHT - 5 - radius);
            ctx.arcTo(categoryX + categoryWidth - 5, y + DIMENSIONS.ROW_HEIGHT - 5, categoryX + categoryWidth - 5 - radius, y + DIMENSIONS.ROW_HEIGHT - 5, radius);
            ctx.lineTo(categoryX + 5 + radius, y + DIMENSIONS.ROW_HEIGHT - 5);
            ctx.arcTo(categoryX + 5, y + DIMENSIONS.ROW_HEIGHT - 5, categoryX + 5, y + DIMENSIONS.ROW_HEIGHT - 5 - radius, radius);
            ctx.lineTo(categoryX + 5, y + 5 + radius);
            ctx.arcTo(categoryX + 5, y + 5, categoryX + 5 + radius, y + 5, radius);
            ctx.closePath();

            ctx.fillStyle = eventCategory.color;
            ctx.fill();

            ctx.fillStyle = COLORS.TEXT;
            ctx.textAlign = 'center';
            ctx.fillText(eventCategory.label, categoryX + categoryWidth / 2, y + (DIMENSIONS.ROW_HEIGHT / 2) + 6);
        } else {
            // Dessiner le texte
            const padding = 10;
            const truncatedText = truncateText(ctx, field.text, field.width - (padding * 2));
            ctx.fillStyle = COLORS.TEXT;
            ctx.textAlign = 'left';
            ctx.fillText(truncatedText, currentX + padding, y + (DIMENSIONS.ROW_HEIGHT / 2) + 6);
        }
        currentX += field.width;
    });
}


// Fonction utilitaire pour ajuster la luminosité d'une couleur
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

async function generateImage(classe, dayCourses) {
    if (!Array.isArray(dayCourses) || dayCourses.length === 0) {
        throw new Error('Invalid dayCourses array');
    }

    const { DIMENSIONS } = CANVAS_CONFIG;
    const canvasWidth = DIMENSIONS.WIDTH + (2 * DIMENSIONS.PADDING);
    const canvasHeight = DIMENSIONS.HEADER_HEIGHT +
        (DIMENSIONS.ROW_HEIGHT * dayCourses.length) +
        DIMENSIONS.PADDING +
        DIMENSIONS.BOTTOM_MARGIN;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fond avec dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, CANVAS_CONFIG.COLORS.BACKGROUND);
    gradient.addColorStop(1, adjustColor(CANVAS_CONFIG.COLORS.BACKGROUND, -15));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Coins arrondis
    ctx.beginPath();
    ctx.moveTo(DIMENSIONS.PADDING, DIMENSIONS.PADDING);
    ctx.arcTo(canvasWidth - DIMENSIONS.PADDING, DIMENSIONS.PADDING,
        canvasWidth - DIMENSIONS.PADDING, canvasHeight - DIMENSIONS.PADDING,
        DIMENSIONS.BORDER_RADIUS);
    ctx.arcTo(canvasWidth - DIMENSIONS.PADDING, canvasHeight - DIMENSIONS.PADDING,
        DIMENSIONS.PADDING, canvasHeight - DIMENSIONS.PADDING,
        DIMENSIONS.BORDER_RADIUS);
    ctx.arcTo(DIMENSIONS.PADDING, canvasHeight - DIMENSIONS.PADDING,
        DIMENSIONS.PADDING, DIMENSIONS.PADDING,
        DIMENSIONS.BORDER_RADIUS);
    ctx.arcTo(DIMENSIONS.PADDING, DIMENSIONS.PADDING,
        canvasWidth - DIMENSIONS.PADDING, DIMENSIONS.PADDING,
        DIMENSIONS.BORDER_RADIUS);
    ctx.closePath();
    ctx.clip();

    // En-tête et lignes
    const date = dayCourses[0].date || 'Date inconnue';
    drawHeader(ctx, date, 0, DIMENSIONS.PADDING, canvasWidth);

    dayCourses.forEach((course, index) => {
        const y = DIMENSIONS.HEADER_HEIGHT + index * DIMENSIONS.ROW_HEIGHT + DIMENSIONS.PADDING;
        drawRow(ctx, course, DIMENSIONS.PADDING, y, index, DIMENSIONS.WIDTH);
    });

    const fileName = `./src/EDTsaves/${classe}-${date.replace(/\//g, '-')}.png`;
    fs.writeFileSync(fileName, canvas.toBuffer('image/png'));

    return fileName;
}
module.exports = { generateImage };