const AutocompleteComponent = require("../../structure/AutocompleteComponent");

module.exports = new AutocompleteComponent({
    commandName: 'test',
    run: async (client, interaction) => {
        const focusedOption = interaction.options.getFocused(true);
        const currentInput = focusedOption.value.toLowerCase();

        // Générer les dates pour les 2 semaines à venir
        function generateDateSuggestions() {
            const dates = [];
            const today = new Date();

            // Générer les dates pour les 14 prochains jours
            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Ignorer les weekends
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    const formattedDate = date.toISOString().split('T')[0];
                    dates.push(formattedDate);
                }
            }
            return dates;
        }

        // Obtenir toutes les suggestions de dates
        const allDates = generateDateSuggestions();

        // Filtrer les dates en fonction de l'option en cours
        if (focusedOption.name === "startdate") {
            // Pour la date de début, montrer toutes les dates disponibles
            const filteredDates = allDates
                .filter(date => date.startsWith(currentInput))
                .slice(0, 25); // Limite à 25 suggestions

            await interaction.respond(
                filteredDates.map(date => ({
                    name: formatDateDisplay(date),
                    value: date
                }))
            );
        }
    }
}).toJSON();

// Fonction pour formater l'affichage de la date
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}