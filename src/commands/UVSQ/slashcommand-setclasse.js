const {
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const classeDB = require("../../../db.json");
const fs = require("fs");

module.exports = new ApplicationCommand({
    command: {
        name: "classe",
        description: "Determine la classe de l'utilisateur.",
        type: 1,
        options: [
            {
                name: "classe",
                description: "La classe de l'utilisateur",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            },
        ],
    },
    options: {
        cooldown: 5000,
    },
    /**
     *
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const classeUser = interaction.options.getString("classe", true);
        const user = interaction.user.id;

        let userDB = classeDB[user];
        // Vérifier si l'utilisateur existe déjà dans la base de données
        if (!classeDB[user]) {
            // Si l'utilisateur n'existe pas, on le crée
            classeDB[user] = {
                id: user,
                classe: classeUser,
                dailyReminder: false,
                weeklyReminder: false,
                lastRequest: ["None", "None"],
            };
            // console.log("Nouvel utilisateur ajouté :", classeDB[user]);
        } else {
            // Si l'utilisateur existe, on met à jour ses informations
            classeDB[user].classe = classeUser; // Mettre à jour la classe (exemple)
            // console.log("Informations utilisateur mises à jour :", classeDB[user]);
        }

        // Sauvegarder les modifications dans le fichier JSON
        fs.writeFile("./db.json", JSON.stringify(classeDB, null, 4), (err) => {
            if (err) {
                // console.log("Erreur lors de la sauvegarde :", err);
                return interaction.reply({
                    content: `Erreur lors de la sauvegarde des données : ${err}`,
                    ephemeral: true,
                });
            } else {
                // console.log("Données sauvegardées avec succès !");
                return interaction.reply({
                    content: `Votre classe a bien été enregistrée (${classeUser})`,
                    ephemeral: true,
                });
            }
        });
    },
}).toJSON();
