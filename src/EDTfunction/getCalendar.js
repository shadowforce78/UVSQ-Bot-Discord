const axios = require("axios");

// Configuration de l'API
const API_CONFIG = {
    BASE_URL: "https://edt.iut-velizy.uvsq.fr/Home",
    ENDPOINTS: {
        CALENDAR: "/GetCalendarData",
        EVENT: "/GetSideBarEvent"
    },
    HEADERS: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01"
    }
};

/**
 * Formate l'identifiant de groupe pour l'API
 * @param {string} classe - Identifiant de la classe
 * @returns {Object} Informations du groupe formatées
 */
const formatGroupIdentifier = (classe) => {
    const group = `VEL@${classe}@103`.split("@");
    return {
        resType: group[2] || "103",
        federationId: group[1]
    };
};

/**
 * Formate un événement du calendrier
 * @param {Object} event - Événement brut de l'API
 * @returns {Object} Événement formaté
 */
const formatCalendarEvent = (event) => ({
    id: event.id,
    startTime: new Date(event.start),
    endTime: new Date(event.end)
});

/**
 * Récupère les données du calendrier pour une période donnée
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @param {string} classe - Identifiant de la classe
 * @returns {Promise<Array>} Liste des événements
 */
async function getCalendar(startDate, endDate, classe) {
    try {
        const group = formatGroupIdentifier(classe);
        const postData = new URLSearchParams({
            start: startDate,
            end: endDate,
            resType: group.resType,
            calView: 'agendaDay',
            'federationIds[]': group.federationId,
            colourScheme: '3'
        }).toString();

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALENDAR}`,
            postData,
            { headers: API_CONFIG.HEADERS }
        );

        if (!Array.isArray(response.data)) {
            console.error("Format de réponse invalide");
            return [];
        }

        const events = response.data
            .map(formatCalendarEvent)
            .sort((a, b) => a.startTime - b.startTime);

        return events;

    } catch (error) {
        console.error("Erreur lors de la récupération du calendrier:", error.message);
        throw new Error("Impossible de récupérer le calendrier");
    }
}

/**
 * Parse les éléments d'un événement
 * @param {Array} elements - Éléments de l'événement
 * @returns {Object} Détails de l'événement parsés
 */
const parseEventElements = (elements) => {
    const details = {};
    for (const element of elements) {
        if (element.label === 'Time') {
            const [date, time] = element.content.split(' ');
            details.date = date;
            details.time = time;
        } else {
            details[element.label] = element.content;
        }
    }
    return details;
};

/**
 * Récupère les détails d'un événement spécifique
 * @param {string} id - Identifiant de l'événement
 * @returns {Promise<Object>} Détails de l'événement
 */
async function getEvent(id) {
    try {
        const postData = new URLSearchParams({
            eventId: id
        }).toString();

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENT}`,
            postData,
            { headers: API_CONFIG.HEADERS }
        );

        const event = response.data;

        if (!event || !event.elements || !Array.isArray(event.elements)) {
            throw new Error("Format d'événement invalide");
        }

        const eventDetails = parseEventElements(event.elements);
        const groupedEvents = {};

        // Organisation des événements par date
        if (!groupedEvents[eventDetails.date]) {
            groupedEvents[eventDetails.date] = {};
        }

        const moduleId = eventDetails.Module || eventDetails.Group;
        if (!groupedEvents[eventDetails.date][moduleId]) {
            groupedEvents[eventDetails.date][moduleId] = [];
        }

        groupedEvents[eventDetails.date][moduleId].push(eventDetails);

        return groupedEvents;

    } catch (error) {
        console.error(`Erreur lors de la récupération de l'événement ${id}:`, error.message);
        throw new Error(`Impossible de récupérer les détails de l'événement ${id}`);
    }
}

module.exports = {
    getCalendar,
    getEvent
};