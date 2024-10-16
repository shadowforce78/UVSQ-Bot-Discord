const axios = require('axios');

async function getEvent(id) {
    const url = "https://edt.iut-velizy.uvsq.fr/Home/GetSideBarEvent";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        // "Accept-Language": "fr-FR",
    };

    const postData = `eventId=${encodeURIComponent(id)}`;

    try {
        const response = await axios.post(url, postData, { headers });

        const events = response.data;
        return events;
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

module.exports = { getEvent };
