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

        if (interaction.user.id != "918916801994309752") {
            return interaction.followUp({
                content: "Vous n'avez pas la permission d'utiliser cette commande (seul le developpeur peut l'utiliser)",
            });
        }

        let user = interaction.user.id
        let userDB = classeDB[user]

        // Si l'utilisateur n'a pas de classe
        if (!userDB) {
            return interaction.followUp({
                content: "Vous n'avez pas de classe définie !",
            });
        }

        // Si l'utilisateur a une classe
        classe = userDB.classe

        interaction.followUp({
            content: `Votre classe est ${classe} !`,
        })

    },
};
