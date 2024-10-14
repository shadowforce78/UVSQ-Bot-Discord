const axios = require('axios');

// Fonction pour récupérer et formater l'emploi du temps
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

        // Vérifier s'il y a des événements
        if (!Array.isArray(events) || events.length === 0) {
            console.log("Aucun événement trouvé pour la période donnée.");
            return [];
        }

        // Fonction pour la date
        function convertDateTime(input) {
            return input.replace('T', ' ').slice(0, 16);
        }

        // Couleurs pour les catégories d'événements
        const colors = {
            "Travaux Dirigés (TD)": "blue",
            "Travaux Pratiques (TP)": "purple",
            "Cours Magistraux (CM)": "red",
            "CM": "blue",
            "Réunion": "purple",
            "TD": "yellow"
        }

        // Mapper les événements en structurant bien les données, avec prise en compte des cas où certaines infos peuvent manquer
        const calendarData = events.map((event) => {

            // Extraire les informations de la description
            // TODO get group and colors : https://github.com/Escartem/EDTVelizy/blob/master/app/api/getCalendar/route.js

            const group = []


            return {
                id: event.id,
                title: group[0] == "VEL" ? meta[3] : meta[2].split(" - ")[1],
                people: group[0] == "VEL" ? [meta[0]] : ["Aucun prof"],
                location: group[0] == "VEL" ? meta[2] : meta[1],
                calendarId: colors[event.eventCategory],
                start: convertDateTime(event.start),
                end: convertDateTime(event.end),
                full: 0
            };
        });

        // Sort
        calendarData.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut))

        return calendarData;  // Retourne les données formatées

    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null;  // Retourner null en cas d'erreur
    }
}

module.exports = { getCalendar };
