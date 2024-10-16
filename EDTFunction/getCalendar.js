const axios = require("axios");

// Fonction pour récupérer et formater l'emploi du temps
async function getCalendar(startDate, endDate, classe) {
    // URL de l'API
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";

    // Headers pour la requête POST
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    };

    const group = "VEL@INF1-B2@103".split("@");
    if (group.length === 2) {
        group.push("103");
    }

    // Corps de la requête
    const postData = `start=${startDate}&end=${endDate}&resType=${group[2]}&calView=agendaDay&federationIds%5B%5D=${group[1]}&colourScheme=3`;

    try {
        const response = await axios.post(url, postData, { headers });
        const events = response.data;

        // Vérifier s'il y a des événements
        if (!Array.isArray(events) || events.length === 0) {
            console.log("Aucun événement trouvé pour la période donnée.");
            return [];
        }

        // Mapper les événements en structurant bien les données
        const calendarData = events.map((event) => {
            return { id: event.id, ...event }; // Retourne l'ID et le reste de l'événement
        });
        return calendarData; // Retourne les données formatées
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null; // Retourner null en cas d'erreur
    }
}

// Fonction pour récupérer les détails d'un événement
async function getEvent(id) {
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetSideBarEvent";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    };

    const postData = `eventId=${encodeURIComponent(id)}`;

    try {
        const response = await axios.post(url, postData, { headers });
        const event = response.data;

        return groupEventByDate(event); // Retourne l'événement groupé par date
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'événement avec ID ${id} :`, error.message);
        return {}; // Retourne un objet vide en cas d'erreur
    }
}

// Fonction pour grouper les événements par date
function groupEventByDate(event) {
    const groupedEvents = {};

    // Vérifie si l'objet a des éléments
    if (!event || !event.elements || !Array.isArray(event.elements)) {
        console.error("L'événement doit avoir des éléments sous forme de tableau !");
        return groupedEvents; // Retourne un objet vide si pas valide
    }

    const date = event.elements.find(element => element.label === 'Time').content.split(' ')[0]; // Récupère la date

    // Crée un tableau pour la date si pas existant
    if (!groupedEvents[date]) {
        groupedEvents[date] = {};
    }

    // Récupère les éléments pertinents à ajouter
    const eventDetails = event.elements.reduce((acc, curr) => {
        acc[curr.label] = curr.content;
        return acc;
    }, {});

    const moduleId = eventDetails.Module || eventDetails.Group; // Utiliser un identifiant unique, comme Module ou Group

    // Ajoute l'événement sous l'identifiant du module
    if (!groupedEvents[date][moduleId]) {
        groupedEvents[date][moduleId] = []; // Crée un tableau pour ce module si pas existant
    }

    groupedEvents[date][moduleId].push(eventDetails); // Ajoute l'événement au groupe sous l'identifiant

    return groupedEvents; // Retourne l'objet avec les événements groupés par date et par module
}

// Exporter les fonctions
module.exports = { getCalendar, getEvent };
