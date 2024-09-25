const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
} = require("discord.js");
module.exports = {
    name: "config",
    description: "Configure les rappels automatiques de l'emploi du temps",
    userperm: [""],
    botperm: [""],
    /*
    * @param {Client} client
    * @param {CommandInteraction} interaction
    * @param {String[]} args
    */
    run: async (client, interaction, args) => {
        const embed = new MessageEmbed()
            .setTitle("Configuration des rappels")
            .setDescription(
                "Configurez les rappels automatiques de votre emploi du temps"
            )
            .addFields(
                {
                    name: "1️⃣ - Rappel quotidien",
                    value: "Rappel quotidien de votre emploi du temps",
                    inline: false,
                },
                {
                    name: "2️⃣ - Rappel hebdomadaire",
                    value: "Rappel hebdomadaire de votre emploi du temps",
                    inline: false,
                },
                {
                    name: "3️⃣ - Désactiver les rappels",
                    value: "Désactive les rappels automatiques",
                    inline: false,
                }
            );

        const row = new MessageActionRow().addComponents(
            {
                type: "BUTTON",
                label: "1️⃣",
                style: "PRIMARY",
                customId: "daily",
            },
            {
                type: "BUTTON",
                label: "2️⃣",
                style: "PRIMARY",
                customId: "weekly",
            },
            {
                type: "BUTTON",
                label: "3️⃣",
                style: "DANGER",
                customId: "disable",
            }
        );

        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        let dateDebut;

        if (day !== 1) { // If today is not a Monday
            const diff = today.getDate() - day + 1;
            dateDebut = new Date(today.setDate(diff));
        } else {
            dateDebut = today;
        }

        dateDebut = dateDebut.toISOString().slice(0, 10); // Format: YYYY-MM-DD

        console.log(dateDebut)

        interaction.followUp({ embeds: [embed], components: [row] });
    },
};
