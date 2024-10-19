const { Client, CommandInteraction } = require("discord.js");
const db = require("../../db.json");

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

        const dbSchema = {
            id: String,
            classe: String,
            dailyReminder: Boolean,
            weeklyReminder: Boolean,
        }

        const id = interaction.user.id;
        const classe = "ClasseTest";
        const dailyReminder = false;
        const weeklyReminder = false;

        db.push({ id: id, classe: classe, dailyReminder: dailyReminder, weeklyReminder: weeklyReminder });
        interaction.followUp({ content: "Utilisateur ajouté à la base de données" });

    },
};
