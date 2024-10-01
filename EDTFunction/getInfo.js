const axios = require('axios');

// Fonction pour récupérer l'emploi du temps
async function getCalendar(startDate, endDate, classe) {
    // URL de l'API
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";

    // Headers pour la requête POST
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    };

    // Corps de la requête
    const postData = `start=${startDate}&end=${endDate}&resType=103&calView=agendaWeek&federationIds%5B%5D=${classe}&colourScheme=3`;

    try {
        const response = await axios.post(url, postData, { headers });
        const events = response.data;

        // Vérifier si des événements sont renvoyés
        if (!Array.isArray(events) || events.length === 0) {
            console.log("Aucun événement trouvé pour la période donnée.");
            return [];
        }

        // Mapper les événements pour obtenir les informations nécessaires
        const calendarData = events.map((event) => {
            return {
                id: event.id,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                title: event.description.split('<br />')[0],  // Prend le nom de l'enseignant
                description: event.description.replace(/<br\s*\/?>/g, "\n"), // Remplace les balises HTML par des sauts de ligne
                location: event.sites.join(', '),  // Joins les sites s'il y en a plusieurs
                department: event.department,
                faculty: event.faculty,
                eventCategory: event.eventCategory,
                modules: event.modules.join(', '), // Joins les modules s'il y en a plusieurs
                backgroundColor: event.backgroundColor,
                textColor: event.textColor,
            };
        });

        return calendarData; // Retourne les données des événements

    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        return null; // Retourner null en cas d'erreur
    }
}

module.exports = { getCalendar };
