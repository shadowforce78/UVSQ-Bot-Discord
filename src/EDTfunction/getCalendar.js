const axios = require("axios");

// --- Configuration de l'API ---
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
 * Formate le corps de la requête pour récupérer les événements
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @param {string} classe - Identifiant de la classe
 * @returns {string} Corps de la requête formaté
 */
const createRequestBody = (startDate, endDate, classe) => {
    const group = `VEL@${classe}@103`.split("@");
    return new URLSearchParams({
        start: startDate,
        end: endDate,
        resType: group[2] || "103",
        calView: "agendaWeek",
        "federationIds[]": group[1],
        colourScheme: "3"
    }).toString();
};

/**
 * Formate un événement brut récupéré de l'API
 * @param {Object} event - Événement brut
 * @returns {Object} Événement formaté
 */
const formatEvent = (event) => ({
    id: event.id,
    startTime: new Date(event.start),
    endTime: new Date(event.end),
    description: event.description
        ? event.description.replace(/<br \/>/g, "\n").replace(/&39;/g, "'").trim()
        : "Pas de description",
    professor: event.description ? event.description.split("<br />")[0] : "Non spécifié",
    module: event.modules && event.modules.length > 0 ? event.modules.join(", ") : "Non spécifié",
    type: event.eventCategory || "Non spécifié",
    site: event.sites && event.sites.length > 0 ? event.sites.join(", ") : "Non spécifié",
    color: event.backgroundColor
});

/**
 * Récupère les événements formatés pour une période donnée
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @param {string} classe - Identifiant de la classe
 * @returns {Promise<Array>} Liste des événements formatés
 */
async function getCalendar(startDate, endDate, classe) {
    try {
        const body = createRequestBody(startDate, endDate, classe);

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALENDAR}`,
            body,
            { headers: API_CONFIG.HEADERS }
        );

        if (!Array.isArray(response.data)) {
            console.error("Format de réponse invalide");
            return [];
        }

        return response.data.map(formatEvent);

    } catch (error) {
        console.error("Erreur lors de la récupération du calendrier:", error.message);
        throw new Error("Impossible de récupérer le calendrier.");
    }
}

/**
 * Parse les détails d'un événement
 * @param {Array} elements - Éléments de l'événement
 * @returns {Object} Détails de l'événement parsés
 */
const parseEventDetails = (elements) => {
    const details = {};
    elements.forEach((element) => {
        if (element.label === "Time") {
            const [date, time] = element.content.split(" ");
            details.date = date;
            details.time = time;
        } else {
            details[element.label] = element.content;
        }
    });
    return details;
};

/**
 * Récupère les détails d'un événement donné son ID
 * @param {string} eventId - Identifiant de l'événement
 * @returns {Promise<Object>} Détails de l'événement
 */
async function getEvent(eventId) {
    try {
        const body = new URLSearchParams({ eventId }).toString();

        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENT}`,
            body,
            { headers: API_CONFIG.HEADERS }
        );

        const event = response.data;

        if (!event || !Array.isArray(event.elements)) {
            throw new Error("Format d'événement invalide.");
        }

        return parseEventDetails(event.elements);

    } catch (error) {
        console.error(`Erreur lors de la récupération de l'événement ${eventId}:`, error.message);
        throw new Error(`Impossible de récupérer les détails de l'événement ${eventId}.`);
    }
}

module.exports = {
    getCalendar,
    getEvent
};
