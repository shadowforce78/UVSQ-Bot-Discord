const { ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const classeDB = require('../../../db.json');
const fs = require('fs');

module.exports = new ApplicationCommand({
    command: {
        name: 'classe',
        description: 'Determine la classe de l\'utilisateur.',
        type: 1,
        options: [
            {
                name:'classe',
                description: 'La classe de l\'utilisateur',
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            }
        ]
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
        const classeUser = interaction.options.getString('classe', true);
        const user = interaction.user.id;

        if (!classe.includes(classeUser)) {
            return interaction.followUp({
                content:
                    "La classe n'est pas valide\nVeuillez choisir une classe parmi les suivantes : \n`" +
                    classe.join(",\n") +
                    "`\n(si votre classe n'est pas dans la liste, veuillez contacter `saumondeluxe` pour l'ajouter)",
            });
        } else {
            let userDB = classeDB[user]
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
                classeDB[user].classe = classeUser  // Mettre à jour la classe (exemple)
                // console.log("Informations utilisateur mises à jour :", classeDB[user]);
            }

            // Sauvegarder les modifications dans le fichier JSON
            fs.writeFile('./db.json', JSON.stringify(classeDB, null, 4), (err) => {
                if (err) {
                    console.log("Erreur lors de la sauvegarde :", err);
                } else {
                    console.log("Données sauvegardées avec succès !");
                }
            });


            interaction.followUp({
                content: `Votre classe a été définie sur ${classeUser}`,
            });
        }
    }
}).toJSON();