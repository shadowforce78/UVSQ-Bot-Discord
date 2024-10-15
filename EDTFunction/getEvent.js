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
    encodedID = encodeURIComponent(id);
    const postData = `eventId=${encodedID}`;

    try {
        const response = await axios.post(url, postData, { headers });
        const events = response.data;

        return events;

        // Vérification des events : https://github.com/Escartem/EDTVelizy/blob/master/app/api/getEvent/route.js

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null;  // Retourner null en cas d'erreur
    }
}

module.exports = { getEvent };
