// const axios = require("axios");

// // Fonction pour récupérer et formater l'emploi du temps
// async function getCalendar(startDate, endDate, classe) {
//     // URL de l'API
//     const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";

//     // Headers pour la requête POST
//     const headers = {
//         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "Accept": "application/json, text/javascript, */*; q=0.01",
//     };

//     const group = `VEL@${classe}@103`.split("@");
//     if (group.length === 2) {
//         group.push("103");
//     }

//     // Corps de la requête
//     const postData = `start=${startDate}&end=${endDate}&resType=${group[2]}&calView=agendaDay&federationIds%5B%5D=${group[1]}&colourScheme=3`;

//     try {
//         const response = await axios.post(url, postData, { headers });
//         const events = response.data;

//         // Vérifier s'il y a des événements
//         if (!Array.isArray(events) || events.length === 0) {
//             // console.log("Aucun événement trouvé pour la période donnée.");
//             return [];
//         }

//         // Mapper les événements en structurant bien les données
//         const calendarData = events.map((event) => {
//             // Convertir la date et l'heure en format utilisable pour le tri
//             const startDateTime = new Date(event.start);
//             const endDateTime = new Date(event.end);
//             return {
//                 id: event.id,
//                 startTime: startDateTime,
//                 endTime: endDateTime,
//             }; // Ajoute les objets de temps au retour
//         });

//         // Trier les événements par heure de début croissante
//         calendarData.sort((a, b) => a.startTime - b.startTime);

//         return calendarData; // Retourne les données formatées et triées
//     } catch (error) {
//         console.error("Erreur lors de la récupération des données :", error);
//         return null; // Retourner null en cas d'erreur
//     }
// }

// // Fonction pour récupérer les détails d'un événement
// async function getEvent(id) {
//     const url = "https://edt.iut-velizy.uvsq.fr/Home/GetSideBarEvent";
//     const headers = {
//         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "Accept": "application/json, text/javascript, */*; q=0.01",
//     };

//     const postData = `eventId=${encodeURIComponent(id)}`;

//     try {
//         const response = await axios.post(url, postData, { headers });
//         const event = response.data;

//         return groupEventByDate(event); // Retourne l'événement groupé par date
//     } catch (error) {
//         console.error(`Erreur lors de la récupération de l'événement avec ID ${id} :`, error.message);
//         return {}; // Retourne un objet vide en cas d'erreur
//     }
// }

// // Fonction pour grouper les événements par date
// function groupEventByDate(event) {
//     const groupedEvents = {};

//     // Vérifie si l'objet a des éléments
//     if (!event || !event.elements || !Array.isArray(event.elements)) {
//         console.error("L'événement doit avoir des éléments sous forme de tableau !");
//         return groupedEvents; // Retourne un objet vide si pas valide
//     }

//     const date = event.elements.find(element => element.label === 'Time').content.split(' ')[0]; // Récupère la date

//     // Crée un tableau pour la date si pas existant
//     if (!groupedEvents[date]) {
//         groupedEvents[date] = {};
//     }

//     // Récupère les éléments pertinents à ajouter
//     const eventDetails = event.elements.reduce((acc, curr) => {
//         acc[curr.label] = curr.content;
//         return acc;
//     }, {});

//     const moduleId = eventDetails.Module || eventDetails.Group; // Utiliser un identifiant unique, comme Module ou Group

//     // Ajoute l'événement sous l'identifiant du module
//     if (!groupedEvents[date][moduleId]) {
//         groupedEvents[date][moduleId] = []; // Crée un tableau pour ce module si pas existant
//     }

//     groupedEvents[date][moduleId].push(eventDetails); // Ajoute l'événement au groupe sous l'identifiant

//     return groupedEvents; // Retourne l'objet avec les événements groupés par date et par module
// }

// // Exporter les fonctions
// module.exports = { getCalendar, getEvent };

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