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

        const events = response.data.elements; // Changez ici pour récupérer les éléments

        // Vérifiez si la structure est correcte
        if (!events || !Array.isArray(events) || events.length === 0) {
            console.warn(`Aucun élément trouvé pour l'ID d'événement: ${id}`);
            return [];
        }

        // Fonction pour parser un événement
        function parseEvent(event) {
            let parsedEvent = {
                time: null,
                module: null,
                group: null,
                room: null,
                staff: null,
                eventCategory: null,
                notes: null
            };

            event.forEach(element => {
                switch (element.label) {
                    case 'Time':
                        parsedEvent.time = element.content;
                        break;
                    case 'Module':
                        parsedEvent.module = element.content;
                        break;
                    case 'Group':
                        parsedEvent.group = element.content;
                        break;
                    case 'Room':
                        parsedEvent.room = element.content;
                        break;
                    case 'Staff':
                        parsedEvent.staff = element.content;
                        break;
                    case 'Event category':
                        parsedEvent.eventCategory = element.content;
                        break;
                    case 'Notes':
                        parsedEvent.notes = element.content;
                        break;
                    default:
                        break;
                }
            });

            return parsedEvent;
        }

        const parsedEvents = events.map(event => parseEvent(event));

        // Filtrer les événements valides
        return parsedEvents.filter(event => event.time !== null || event.module !== null || event.group !== null || event.room !== null);

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

module.exports = { getEvent };
