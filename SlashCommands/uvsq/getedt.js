const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const schemaClasse = require('../../schema/classe');
const axios = require('axios');

module.exports = {
    name: "edt",
    description: "Permet de définir la classe de l'utilisateur",
    userperm: [""],
    botperm: [""],
    options: [
        {
            name: "startdate",
            description: "Date de début de l'emploi du temps (format : YYYY-MM-DD)",
            type: "STRING",
            required: true,
        },
        {
            name: "enddate",
            description: "Date de fin de l'emploi du temps (format : YYYY-MM-DD)",
            type: "STRING",
            required: true,
        }
    ],
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
        // const data = schemaClasse.findOne({ id: interaction.user.id });

        // if (!data) {
        //     return interaction.followUp('Vous n\'avez pas défini votre classe\nFaites `/classe` pour définir votre classe');
        // }

        const classe = 'INF1-B'

        const dateDebut = interaction.options.getString("startdate");
        const dateFin = interaction.options.getString("enddate");


        // Format de la date : YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDebut) || !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
            return interaction.followUp("La date doit être au format YYYY-MM-DD");
        }

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, text/javascript, */*; q=0.01"
        };


        const postdata = `start=${dateDebut}&end=${dateFin}&resType=103&calView=agendaWeek&federationIds%5B%5D=${classe}&colourScheme=3`;

        const response = await axios.post(url, postdata, { headers: headers });

        const events = response.data; // Pas besoin de JSON.stringify ici, data est déjà un tableau d'objets

        const cours = [];

        events.forEach(event => {
            const nomCours = event.eventCategory; // Nom du cours
            const batimentCours = event.sites[0];    // Batiment du cours (première entrée dans "sites")

            // Extraction du nom du prof depuis "description"
            const descriptionParts = event.description.split('<br />');
            const nomProf = descriptionParts[0].trim(); // Le nom du prof est avant le premier <br />
            const salleCours = descriptionParts[2].trim(); // La salle est après le premier <br />

            const dateDebut = event.start; // Date de début du cours
            const dateFin = event.end;

            cours.push({
                nomCours,
                batimentCours,
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
                        value: `Professeur : ${cours.nomProf}\nBatiment : ${cours.batimentCours}\nSalle : ${cours.salleCours}\nDate de début : ${cours.dateDebut}\nDate de fin : ${cours.dateFin}`
                    };
                })
            );

        interaction.followUp({ embeds: [embed] });
    }
};
