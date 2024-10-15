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
    const postData = `eventId=${id}`

    try {
        const response = await axios.post(url, postData, { headers });
        const events = response.data;

        // Vérifier s'il y a des événements
        if (!Array.isArray(events) || events.length === 0) {
            console.log("Aucun événement trouvé pour la période donnée.");
            return [];
        }

        console.log(events)

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null;  // Retourner null en cas d'erreur
    }
}

module.exports = { getEvent };
