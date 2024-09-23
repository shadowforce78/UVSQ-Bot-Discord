const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const schemaClasse = require('../../schema/classe');
const axios = require('axios');

module.exports = {
    name: "edt",
    description: "Permet de définir la classe de l'utilisateur",
    userperm: [""],
    botperm: [""],
    /**
    *
    * @param {Client} client
    * @param {CommandInteraction} interaction
    * @param {String[]} args
    */
    run: async (client, interaction, args) => {

        const classeUser = interaction.options.getString("classe");
        const url = "https://edt.iut-velizy.uvsq.fr/Home/GetCalendarData";
        const method = "POST";
        const data = schemaClasse.findOne({ id: interaction.user.id });

        if (!data) {
            return interaction.followUp('Vous n\'avez pas défini votre classe\nFaites `/classe` pour définir votre classe');
        }

        const classe = data.classe;

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01"
        };


        const postdata = `start=2024-09-23&end=2024-09-23&resType=103&calView=agendaWeek&federationIds%5B%5D=${classe}&colourScheme=3`;

        const response = await axios.post(url, postdata, { headers: headers });

        const events = response.data; // Pas besoin de JSON.stringify ici, data est déjà un tableau d'objets

        const cours = [];

        events.forEach(event => {
            const nomCours = event.eventCategory; // Nom du cours
            const salleCours = event.sites[0];    // Salle du cours (première entrée dans "sites")

            // Extraction du nom du prof depuis "description"
            const descriptionParts = event.description.split('<br />');
            const nomProf = descriptionParts[0].trim(); // Le nom du prof est avant le premier <br />

            const dateDebut = event.start; // Date de début du cours
            const dateFin = event.end;

            cours.push({
                nomCours,
                salleCours,
                nomProf,
                dateDebut,
                dateFin
            });
        });

        const embed = new MessageEmbed()
            .setTitle("Emploi du temps")
            .setColor("#FF8080")
            .setFooter("UVSQ")
            .setTimestamp()
            .setDescription("Voici votre emploi du temps")
            .addFields(
                cours.map(cours => {
                    return {
                        name: cours.nomCours,
                        value: `Professeur : ${cours.nomProf}\nSalle : ${cours.salleCours}\nDate de début : ${cours.dateDebut}\nDate de fin : ${cours.dateFin}`
                    };
                })
            );

        interaction.followUp({ embeds: [embed] });
    }
};
