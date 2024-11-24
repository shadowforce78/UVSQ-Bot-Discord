const { createCanvas } = require('canvas');
const fs = require('fs');

// Configuration constants
const CANVAS_CONFIG = {
    COLORS: {
        BACKGROUND: '#FFFFFF',
        TEXT: '#333333',
        ALTERNATE_ROW: '#f2f2f2',
        BORDER: '#dddddd',
        DAY_BACKGROUND: '#f9f9f9'
    },
    FONTS: {
        TITLE: 'bold 24px Arial',
        HEADER: 'bold 16px Arial',
        SUBHEADER: 'bold 12px Arial',
        CONTENT: '12px Arial'
    },
    DIMENSIONS: {
        DAY_WIDTH: 500,
        ROW_HEIGHT: 35,
        HEADER_HEIGHT: 60,
        DAY_HEADER_HEIGHT: 40,
        PADDING: 20,
        CELL_PADDING: 8,
        BORDER_RADIUS: 10
    }
};

const EVENT_CATEGORIES = {
    TP: { color: '#8000FF', label: 'TP' },
    TD: { color: '#00FF00', label: 'TD' },
    CM: { color: '#FF8080', label: 'CM' },
    SAE: { color: '#808080', label: 'SAE' },
    INT: { color: '#FFFF00', label: 'INT' },
    REUNION: { color: '#D7E1FF', label: 'RÉU' },
    PROJET: { color: '#FF0080', label: 'PROJ' },
    DIVERS: { color: '#80FFFF', label: 'DIV' },
    DS: { color: '#FF00FF', label: 'DS' }
};

const COLUMN_CONFIG = [
    { header: 'Heure', width: 90, key: 'time' },
    { header: 'Matière', width: 200, key: 'module' },
    { header: 'Prof', width: 100, key: 'staff' },
    { header: 'Salle', width: 70, key: 'room' },
    { header: 'Type', width: 40, key: 'type' }
];

/**
 * Tronque le texte si nécessaire en ajoutant des points de suspension
 */
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

/**
 * Détermine la catégorie et la couleur d'un événement
 */
function getEventCategory(category) {
    if (!category) return { type: 'N/A', color: CANVAS_CONFIG.COLORS.BACKGROUND };

    const categoryMap = {
        'TP': EVENT_CATEGORIES.TP,
        'TD': EVENT_CATEGORIES.TD,
        'CM': EVENT_CATEGORIES.CM,
        'Projet en autonomie': EVENT_CATEGORIES.SAE,
        'Integration': EVENT_CATEGORIES.INT,
        'Reunion': EVENT_CATEGORIES.REUNION,
        'projet tutore': EVENT_CATEGORIES.PROJET,
        'Divers': EVENT_CATEGORIES.DIVERS,
        'DS': EVENT_CATEGORIES.DS,
        'Contrôles': EVENT_CATEGORIES.DS
    };

    for (const [key, value] of Object.entries(categoryMap)) {
        if (category.includes(key)) return value;
    }

    return { type: 'N/A', color: CANVAS_CONFIG.COLORS.BACKGROUND };
}

/**
 * Dessine l'en-tête du jour
 */
function drawDayHeader(ctx, date, x, y, width) {
    ctx.font = CANVAS_CONFIG.FONTS.HEADER;
    ctx.fillStyle = CANVAS_CONFIG.COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(date, x + width / 2, y + 25);

    // Draw column headers
    ctx.font = CANVAS_CONFIG.FONTS.SUBHEADER;
    let currentX = x;
    COLUMN_CONFIG.forEach(column => {
        ctx.fillText(
            column.header,
            currentX + column.width / 2,
            y + CANVAS_CONFIG.DIMENSIONS.DAY_HEADER_HEIGHT
        );
        currentX += column.width;
    });
}

/**
 * Dessine une cellule de cours
 */
function drawCourseCell(ctx, course, x, y, rowIndex) {
    const { DIMENSIONS, COLORS } = CANVAS_CONFIG;

    // Background
    ctx.fillStyle = rowIndex % 2 === 0 ? COLORS.BACKGROUND : COLORS.ALTERNATE_ROW;
    ctx.fillRect(x, y, DIMENSIONS.DAY_WIDTH, DIMENSIONS.ROW_HEIGHT);

    // Get time from course
    const time = course.Time ? course.Time.match(/\d{2}:\d{2}-\d{2}:\d{2}/)?.[0] || 'N/A' : 'N/A';
    const eventCategory = getEventCategory(course['Event category']);

    // Draw cells
    ctx.font = CANVAS_CONFIG.FONTS.CONTENT;
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'left';

    let currentX = x + DIMENSIONS.CELL_PADDING;

    // Draw each column
    const cellContents = [
        { text: time, width: COLUMN_CONFIG[0].width },
        { text: course.Module || 'N/A', width: COLUMN_CONFIG[1].width },
        { text: course.Staff || 'N/A', width: COLUMN_CONFIG[2].width },
        { text: course.Room || 'N/A', width: COLUMN_CONFIG[3].width }
    ];

    cellContents.forEach(({ text, width }) => {
        const maxWidth = width - (2 * DIMENSIONS.CELL_PADDING);
        const truncatedText = truncateText(ctx, text, maxWidth);
        ctx.fillText(truncatedText, currentX, y + (DIMENSIONS.ROW_HEIGHT / 2) + 4);
        currentX += width;
    });

    // Draw event type with background color
    const typeX = currentX;
    const typeWidth = COLUMN_CONFIG[4].width;
    ctx.fillStyle = eventCategory.color;
    ctx.fillRect(typeX, y + 2, typeWidth - 4, DIMENSIONS.ROW_HEIGHT - 4);
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(eventCategory.type, typeX + typeWidth / 2, y + (DIMENSIONS.ROW_HEIGHT / 2) + 4);
}

/**
 * Génère l'image de l'emploi du temps
 */
async function generateImage(classe, coursParJourArray) {
    // Fusion des données de cours
    const coursParJour = coursParJourArray.reduce((acc, curr) => {
        const dateKey = Object.keys(curr)[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(...Object.values(curr[dateKey]).flat());
        return acc;
    }, {});

    const dates = Object.keys(coursParJour);
    if (dates.length === 0) return null;

    // Configuration du canvas
    const { DIMENSIONS } = CANVAS_CONFIG;
    const daysCount = dates.length;
    const maxCoursesPerDay = Math.max(...Object.values(coursParJour).map(day => day.length));
    const columnsCount = Math.min(3, daysCount);
    const rowsCount = Math.ceil(daysCount / columnsCount);

    // Dimensions du canvas
    const canvasWidth = (DIMENSIONS.DAY_WIDTH + DIMENSIONS.PADDING) * columnsCount + DIMENSIONS.PADDING;
    const canvasHeight = DIMENSIONS.HEADER_HEIGHT +
        (DIMENSIONS.ROW_HEIGHT * (maxCoursesPerDay + 1) +
            DIMENSIONS.DAY_HEADER_HEIGHT + DIMENSIONS.PADDING) * rowsCount +
        DIMENSIONS.PADDING;

    // Création du canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = CANVAS_CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Titre principal
    ctx.font = CANVAS_CONFIG.FONTS.TITLE;
    ctx.fillStyle = CANVAS_CONFIG.COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(`Emploi du temps de la classe ${classe}`, canvasWidth / 2, DIMENSIONS.PADDING + 24);

    // Dessin des jours
    dates.forEach((date, dayIndex) => {
        const columnIndex = dayIndex % columnsCount;
        const rowIndex = Math.floor(dayIndex / columnsCount);

        const startX = DIMENSIONS.PADDING + columnIndex * (DIMENSIONS.DAY_WIDTH + DIMENSIONS.PADDING);
        const startY = DIMENSIONS.HEADER_HEIGHT + rowIndex * (DIMENSIONS.ROW_HEIGHT * (maxCoursesPerDay + 1) +
            DIMENSIONS.DAY_HEADER_HEIGHT + DIMENSIONS.PADDING);

        // Container du jour
        ctx.fillStyle = CANVAS_CONFIG.COLORS.DAY_BACKGROUND;
        ctx.strokeStyle = CANVAS_CONFIG.COLORS.BORDER;
        ctx.beginPath();
        ctx.roundRect(
            startX,
            startY,
            DIMENSIONS.DAY_WIDTH,
            DIMENSIONS.ROW_HEIGHT * (maxCoursesPerDay + 1) + DIMENSIONS.DAY_HEADER_HEIGHT,
            DIMENSIONS.BORDER_RADIUS
        );
        ctx.fill();
        ctx.stroke();

        // En-tête du jour
        drawDayHeader(ctx, date, startX, startY, DIMENSIONS.DAY_WIDTH);

        // Cours du jour
        coursParJour[date].forEach((course, courseIndex) => {
            const y = startY + DIMENSIONS.DAY_HEADER_HEIGHT + (courseIndex + 1) * DIMENSIONS.ROW_HEIGHT;
            drawCourseCell(ctx, course, startX, y, courseIndex);
        });
    });

    // Sauvegarde de l'image
    const formatDate = date => date.replace(/\//g, '-');
    const fileName = `./src/EDTsaves/${classe}-${formatDate(dates[0])}-${formatDate(dates[dates.length - 1])}-image.png`;
    fs.writeFileSync(fileName, canvas.toBuffer('image/png'));

    return fileName;
}

module.exports = { generateImage };