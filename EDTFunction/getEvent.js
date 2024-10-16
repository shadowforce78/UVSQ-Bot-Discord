const axios = require('axios');

async function getEvent(id) {
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetSideBarEvent";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    };

    const postData = `eventId=${encodeURIComponent(id)}`;

    try {
        const response = await axios.post(url, postData, { headers });
        const event = response.data; // On s'attend à ce que ce soit un objet représentant un événement

        return groupEventByDate(event); // Retourne l'événement groupé par date

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        return {}; // Retourne un objet vide en cas d'erreur
    }
}

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

module.exports = { getEvent };
