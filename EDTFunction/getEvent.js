const axios = require('axios');

// Fonction pour récupérer et formater l'emploi du temps
async function getEvent(id) {
    // URL de l'API
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetSideBarEvent";

    // Headers pour la requête POST
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    };
    // Corps de la requête
    const encodedID = encodeURIComponent(id);
    const postData = `eventId=${encodedID}`;

    try {
        const response = await axios.post(url, postData, { headers });

        // Log de la réponse pour voir son format
        console.log("Réponse brute de l'API:", response.data);

        const events = response.data;

        // Vérification si `elements` est bien un tableau
        if (!Array.isArray(events.elements)) {
            throw new Error("La réponse de l'API ne contient pas un tableau d'éléments.");
        }

        // Renommer les labels pour les rendre plus explicites
        const renames = {
            "Salle": "Room",
            "Elément pédagogique": "Module",
            "Catégorie d'évènement": "eventCategory",
            "Groupe": "Group",
            "Temps": "Time"
        };

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

            if (event && Array.isArray(event)) {
                event.forEach(element => {
                    const label = renames[element.label] || element.label; // Utilise les renames ou conserve le label original
                    switch (label) {
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
                        case 'eventCategory':
                            parsedEvent.eventCategory = element.content;
                            break;
                        case 'Notes':
                            parsedEvent.notes = element.content;
                            break;
                        default:
                            break;
                    }
                });
            }

            return parsedEvent;
        }

        // Créer la file d'attente des événements parsés
        const eventsQueue = events.elements.map(event => parseEvent(event));

        return eventsQueue;

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        return null;  // Retourner null en cas d'erreur
    }
}

module.exports = { getEvent };
