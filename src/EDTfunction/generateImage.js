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
        CONTENT: '12px Arial'
    },
    DIMENSIONS: {
        WIDTH: 700,
        ROW_HEIGHT: 40,
        HEADER_HEIGHT: 80,
        PADDING: 20,
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

function getEventCategory(category) {
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
    ctx.font = CANVAS_CONFIG.FONTS.HEADER;
    ctx.fillStyle = CANVAS_CONFIG.COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(`Emploi du temps - ${date}`, x + width / 2, y + 30);
}

function drawRow(ctx, course, x, y, rowIndex, width) {
    const { DIMENSIONS, COLORS } = CANVAS_CONFIG;
    const eventCategory = getEventCategory(course['Event category']);

    // Background
    ctx.fillStyle = rowIndex % 2 === 0 ? COLORS.BACKGROUND : COLORS.ALTERNATE_ROW;
    ctx.fillRect(x, y, width, DIMENSIONS.ROW_HEIGHT);

    // Course information
    const fields = [
        { text: course.time || 'N/A', width: 100 },
        { text: course.Module || 'N/A', width: 300 },
        { text: course.Staff || 'N/A', width: 150 },
        { text: course.Room || 'N/A', width: 100 }
    ];

    let currentX = x + DIMENSIONS.PADDING;
    ctx.font = CANVAS_CONFIG.FONTS.CONTENT;
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'left';

    fields.forEach(({ text, width }) => {
        const truncatedText = truncateText(ctx, text, width - 10);
        ctx.fillText(truncatedText, currentX + 5, y + (DIMENSIONS.ROW_HEIGHT / 2) + 4);
        currentX += width;
    });

    // Event type
    const typeX = currentX;
    const typeWidth = 100;
    ctx.fillStyle = eventCategory.color;
    ctx.fillRect(typeX + 5, y + 5, typeWidth - 10, DIMENSIONS.ROW_HEIGHT - 10);
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(eventCategory.label, typeX + typeWidth / 2, y + (DIMENSIONS.ROW_HEIGHT / 2) + 4);
}

async function generateImage(classe, dayCourses) {
    if (!Array.isArray(dayCourses) || dayCourses.length === 0) {
        throw new Error('Invalid dayCourses array');
    }

    const { DIMENSIONS } = CANVAS_CONFIG;
    const canvasWidth = DIMENSIONS.WIDTH + (2 * DIMENSIONS.PADDING);
    const canvasHeight = DIMENSIONS.HEADER_HEIGHT + (DIMENSIONS.ROW_HEIGHT * dayCourses.length) + DIMENSIONS.PADDING;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = CANVAS_CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Header
    const date = dayCourses[0].date || 'Date inconnue';
    drawHeader(ctx, date, 0, DIMENSIONS.PADDING, canvasWidth);

    // Draw rows
    dayCourses.forEach((course, index) => {
        const y = DIMENSIONS.HEADER_HEIGHT + index * DIMENSIONS.ROW_HEIGHT + DIMENSIONS.PADDING;
        drawRow(ctx, course, DIMENSIONS.PADDING, y, index, DIMENSIONS.WIDTH);
    });

    // Save image
    const fileName = `./src/EDTsaves/${classe}-${date.replace(/\//g, '-')}.png`;
    fs.writeFileSync(fileName, canvas.toBuffer('image/png'));

    return fileName;
}

module.exports = { generateImage };
