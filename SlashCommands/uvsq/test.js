const { Client, CommandInteraction } = require("discord.js");
const fs = require("fs");
const classeDB = require('../../db.json')

module.exports = {
    name: "test",
    description: "Ceci est une commande permettant de tester des choses",

    userperm: [""],
    botperm: [""],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        // if (interaction.user.id != "918916801994309752") {
        //     return interaction.followUp({
        //         content: "Vous n'avez pas la permission d'utiliser cette commande (seul le developpeur peut l'utiliser)",
        //     });
        // }

        // Ajout de l'id de l'utilisateur dans la base de données
        let user = interaction.user.id
        let userDB = classeDB[user]
        // Vérifier si l'utilisateur existe déjà dans la base de données
        if (!classeDB[user]) {
            // Si l'utilisateur n'existe pas, on le crée
            classeDB[user] = {
                id: user,
                classe: "INF2-B1",
                dailyReminder: false,
                weeklyReminder: false,
            };
            console.log("Nouvel utilisateur ajouté :", classeDB[user]);
        } else {
            // Si l'utilisateur existe, on met à jour ses informations
            classeDB[user].classe = "INF2-B1";  // Mettre à jour la classe (exemple)
            classeDB[user].dailyReminder = false;  // Mettre à jour dailyReminder (exemple)
            classeDB[user].weeklyReminder = false;  // Mettre à jour weeklyReminder (exemple)
            console.log("Informations utilisateur mises à jour :", classeDB[user]);
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
            content: "Commande de test effectuée avec succès !"
        })

    },
};
