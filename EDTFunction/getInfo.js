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

        // Fonction d'aide pour nettoyer et formater les descriptions
        function parseDescription(description) {
            const parts = description ? description.split('<br />').map(part => part.trim()) : [];

            // Extraire les informations de la description
            const nomProf = parts[0] || "Non spécifié";
            const nomClasse = parts[2] || "Non spécifié";
            const nomMatiere = parts[3] || "Non spécifié";
            const salleCours = parts[4] || "Non spécifié";

            return { nomProf, nomClasse, nomMatiere, salleCours };
        }

        // Mapper les événements en structurant bien les données, avec prise en compte des cas où certaines infos peuvent manquer
        const calendarData = events.map((event) => {
            const { nomProf, nomClasse, nomMatiere, salleCours } = parseDescription(event.description);

            return {
                id: event.id,
                dateDebut: event.start,
                dateFin: event.end,
                jourComplet: event.allDay,
                professeurs: nomProf,  // Nom du professeur
                matiere: nomMatiere,   // Nom de la matière
                classe: nomClasse,     // Nom de la classe (ex: INF1-B)
                salle: salleCours !== "Non spécifié" ? salleCours : "Salle non précisée",  // Salle de cours, ou indication si absente
                sites: event.sites && event.sites.length > 0 ? event.sites.join(', ') : "Site non précisé",  // Emplacement
                categorieCours: event.eventCategory || "Type de cours non précisé",  // Catégorie du cours (ex: CM, TP)
                modules: event.modules && event.modules.length > 0 ? event.modules.join(', ') : "Module non précisé",  // Modules associés
                department: event.department || "Département non précisé",  // Département
                faculty: event.faculty || "Faculté non précisée",  // Faculté
                couleurArrierePlan: event.backgroundColor || "#FFFFFF",  // Couleur de fond par défaut
                couleurTexte: event.textColor || "#000000",  // Couleur du texte par défaut
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
