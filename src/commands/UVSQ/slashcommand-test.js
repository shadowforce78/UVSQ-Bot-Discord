const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot.js");
const ApplicationCommand = require("../../structure/ApplicationCommand.js");
const fs = require("fs");
const { getCalendar, getEvent } = require("../../EDTfunction/getCalendar.js");
const { generateImage } = require("../../EDTfunction/generateImage.js");
const classeDB = require('../../../db.json')

module.exports = new ApplicationCommand({
    command: {
        name: 'test',
        description: 'Commande de test.',
        type: 1,
        options: [
            {
                name: "startdate",
                description: "Date de début de l'emploi du temps (format : YYYY-MM-DD)",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            }
        ],
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        let startDate = interaction.options.getString("startdate", true);
        let endDate = startDate;

        let user = interaction.user.id;
        let userDB = classeDB[user];

        // Si l'utilisateur n'a pas de classe
        if (!userDB) {
            return interaction.reply({
                content:
                    "Tu n'as pas défini ta classe. Utilise la commande `/classe` pour définir ta classe.",
                ephemeral: true,
            });
        }

        // Validation du format de la date
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
        ) {
            return interaction.reply("La date doit être au format YYYY-MM-DD");
        }

        // Fonction pour vérifier si une date est valide
        function isValidDate(dateStr) {
            const date = new Date(dateStr);
            return (
                date instanceof Date &&
                !isNaN(date) &&
                dateStr === date.toISOString().split("T")[0]
            );
        }

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return interaction.reply(
                "Une des dates fournies n'est pas valide. Vérifie que tu utilises un format correct et des dates existantes."
            );
        }

        const classe = userDB.classe;

        try {
            const events = await getCalendar(startDate, endDate, classe);
            if (events.length === 0) {
                await interaction.reply("Aucun événement trouvé pour cette période.");
                return;
            }

            const eventID = [];
            events.forEach((event) => {
                eventID.push(event.id);
            });

            const eventDetailArray = [];

            for (let i = 0; i < eventID.length; i++) {
                const event = await getEvent(eventID[i]);
                eventDetailArray.push(event);
            }

            const image = await generateImage(classe, eventDetailArray);
            const buffer = fs.readFileSync(image);
            await interaction.reply({
                files: [{
                    attachment: buffer,
                    name: "emploi-du-temps.png"
                }]
            });

        } catch (error) {
            console.error(error);
            await interaction.reply("Une erreur est survenue lors de la récupération de l'emploi du temps.");
        }
    }
}).toJSON();