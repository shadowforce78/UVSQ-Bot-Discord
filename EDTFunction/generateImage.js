const { createCanvas } = require('canvas');
const fs = require('fs');
const { start } = require('repl');

function truncateText(ctx, text, maxWidth) {
    let truncated = text;
    const ellipsis = '...';

    // If text fits, return it as is
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }

    // Binary search for the right length
    let start = 0;
    let end = text.length;
    while (start < end) {
        const mid = Math.floor((start + end + 1) / 2);
        const testText = text.slice(0, mid) + ellipsis;
        if (ctx.measureText(testText).width <= maxWidth) {
            start = mid;
        } else {
            end = mid - 1;
        }
    }

    return text.slice(0, start) + ellipsis;
}

async function generateImage(classe, coursParJourArray) {
    // Merge the array of course objects
    const coursParJour = coursParJourArray.reduce((acc, curr) => {
        const dateKey = Object.keys(curr)[0];
        if (!acc[dateKey]) {
            acc[dateKey] = {};
        }
        Object.assign(acc[dateKey], curr[dateKey]);
        return acc;
    }, {});

    // Define colors for event categories
    const categoryColors = {
        TP: '#8000FF',
        TD: '#00FF00',
        CM: '#FF8080',
        SAE: '#808080',
        INT: '#FFFF00',
        REUNION: '#D7E1FF',
        projetutore: '#FF0080',
        divers: '#80FFFF',
        DS: '#FF00FF'
    };

    // Canvas configuration
    const dayWidth = 500; // Increased width to accommodate text better
    const rowHeight = 35; // Increased height for better spacing
    const headerHeight = 60;
    const dayHeaderHeight = 40;
    const padding = 20;
    const cellPadding = 8; // Added cell padding

    // Calculate dimensions
    const daysCount = Object.keys(coursParJour).length;
    const maxCoursesPerDay = Math.max(...Object.values(coursParJour).map(day =>
        Object.keys(day).length
    ));

    const columnsCount = Math.min(3, daysCount);
    const rowsCount = Math.ceil(daysCount / columnsCount);

    // Calculate total canvas dimensions
    const canvasWidth = (dayWidth + padding) * columnsCount + padding;
    const canvasHeight = headerHeight + (rowHeight * (maxCoursesPerDay + 1) + dayHeaderHeight + padding) * rowsCount + padding;

    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw main title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(`Emploi du temps de la classe ${classe}`, canvasWidth / 2, padding + 24);

    // Helper function to get event category and color
    function getEventCategory(category) {
        if (!category) return { type: 'N/A', color: '#FFFFFF' };
        if (category.includes('TP')) return { type: 'TP', color: categoryColors.TP };
        if (category.includes('TD')) return { type: 'TD', color: categoryColors.TD };
        if (category.includes('CM')) return { type: 'CM', color: categoryColors.CM };
        if (category.includes('Projet en autonomie')) return { type: 'SAE', color: categoryColors.SAE };
        if (category.includes('Integration')) return { type: 'INT', color: categoryColors.INT };
        if (category.includes('Reunion')) return { type: 'Réunion', color: categoryColors.REUNION };
        if (category.includes('projet tutore')) return { type: 'SAE', color: categoryColors.projetutore };
        if (category.includes('Divers')) return { type: 'Divers', color: categoryColors.divers };
        if (category.includes('DS') || category.includes('Contrôles')) return { type: 'DS', color: categoryColors.DS };
        return { type: 'N/A', color: '#FFFFFF' };
    }

    // Column configuration
    const columnConfig = [
        { header: 'Heure', width: 90 },
        { header: 'Matière', width: 200 },
        { header: 'Prof', width: 100 },
        { header: 'Salle', width: 70 },
        { header: 'Type', width: 40 }
    ];

    // Draw each day's schedule
    Object.keys(coursParJour).forEach((date, dayIndex) => {
        const columnIndex = dayIndex % columnsCount;
        const rowIndex = Math.floor(dayIndex / columnsCount);

        const startX = padding + columnIndex * (dayWidth + padding);
        const startY = headerHeight + rowIndex * (rowHeight * (maxCoursesPerDay + 1) + dayHeaderHeight + padding);

        // Draw day container
        ctx.fillStyle = '#f9f9f9';
        ctx.strokeStyle = '#dddddd';
        ctx.beginPath();
        ctx.roundRect(
            startX,
            startY,
            dayWidth,
            rowHeight * (maxCoursesPerDay + 1) + dayHeaderHeight,
            10
        );
        ctx.fill();
        ctx.stroke();

        // Draw day header
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.fillText(date, startX + dayWidth / 2, startY + 25);

        // Draw table headers
        ctx.font = 'bold 12px Arial';
        let currentX = startX;
        columnConfig.forEach(column => {
            ctx.fillText(
                column.header,
                currentX + column.width / 2,
                startY + dayHeaderHeight
            );
            currentX += column.width;
        });

        // Draw courses
        Object.keys(coursParJour[date]).forEach((courseKey, courseIndex) => {
            const y = startY + dayHeaderHeight + (courseIndex + 1) * rowHeight;
            const cours = Array.isArray(coursParJour[date][courseKey])
                ? coursParJour[date][courseKey][0]
                : coursParJour[date][courseKey];

            // Draw row background
            ctx.fillStyle = courseIndex % 2 === 0 ? '#ffffff' : '#f2f2f2';
            ctx.fillRect(startX, y, dayWidth, rowHeight);

            // Prepare cell contents
            const time = cours.Time ? cours.Time.match(/\d{2}:\d{2}-\d{2}:\d{2}/)?.[0] || 'N/A' : 'N/A';
            const eventCategory = getEventCategory(cours['Event category']);

            // Draw cell contents
            ctx.font = '12px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';

            let currentX = startX + cellPadding;

            // Draw each cell with proper truncation
            [
                { text: time, width: columnConfig[0].width },
                { text: cours.Module || 'N/A', width: columnConfig[1].width },
                { text: cours.Staff || 'N/A', width: columnConfig[2].width },
                { text: cours.Room || 'N/A', width: columnConfig[3].width }
            ].forEach(({ text, width }) => {
                const truncatedText = truncateText(ctx, text, width - (2 * cellPadding));
                ctx.fillText(truncatedText, currentX, y + (rowHeight / 2) + 4);
                currentX += width;
            });

            // Draw event type with background color
            const typeX = currentX;
            const typeWidth = columnConfig[4].width;
            ctx.fillStyle = eventCategory.color;
            ctx.fillRect(typeX, y + 2, typeWidth - 4, rowHeight - 4);
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(eventCategory.type, typeX + typeWidth / 2, y + (rowHeight / 2) + 4);
        });
    });

    // Save the image and return the path
    const classeName = classe
    const startDateWithDash = Object.keys(coursParJour)[0].replace(/\//g, '-');
    const endDateWithDash = Object.keys(coursParJour)[Object.keys(coursParJour).length - 1].replace(/\//g, '-');


    const fileName = `./EDTsaves/${classeName}-${startDateWithDash}-${endDateWithDash}-image.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(fileName, buffer);
    return fileName;
}

module.exports = { generateImage };