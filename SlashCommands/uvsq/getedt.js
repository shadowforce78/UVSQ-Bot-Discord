const { Client, CommandInteraction } = require("discord.js");
const { getCalendar, getEvent } = require("../../EDTFunction/getCalendar");
const { generateImage } = require("../../EDTFunction/generateImage");
const fs = require("fs");
const classeDB = require('../../db.json')

module.exports = {
  name: "edt",
  description: "Ceci est une commande permettant de tester des choses",
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
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const startDate = interaction.options.getString("startdate");
    const endDate = interaction.options.getString("enddate");


    let user = interaction.user.id
    let userDB = classeDB[user]

    // Si l'utilisateur n'a pas de classe
    if (!userDB) {
      return interaction.followUp({
        content: "Tu n'as pas défini ta classe. Utilise la commande `/classe` pour définir ta classe.",
        ephemeral: true,
      });
    }


    // Validation du format de la date
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return interaction.followUp("La date doit être au format YYYY-MM-DD");
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
      return interaction.followUp(
        "Une des dates fournies n'est pas valide. Vérifie que tu utilises un format correct et des dates existantes."
      );
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Si la date de fin est avant la date de début, on refuse la requête
    if (end < start) {
      return interaction.followUp(
        "La date de fin ne peut pas être avant la date de début."
      );
    }
    // Si plus de 4 jours sont demandés, on refuse la requête
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 4) {
      return interaction.followUp(
        "La durée de l'emploi du temps ne peut pas dépasser 4 jours."
      );
    }


    const classe = userDB.classe;

    try {
      // Appeler la fonction getCalendar avec les valeurs dynamiques
      const calendarRes = await getCalendar(startDate, endDate, classe);

      // Map calendarRes to get the event details
      const eventDetails = await Promise.all(
        calendarRes.map((event) => getEvent(event.id))
      );

      const eventDetailsArray = Object.values(eventDetails);

      // Générer l'image
      await generateImage(classe, eventDetailsArray);

      // Répondre à l'utilisateur avec un message de confirmation
      interaction.followUp({
        content: "L'image de l'emploi du temps a été générée avec succès !",
        files: ["./image.png"],
        ephemeral: true,
      });
    } catch (err) {
      console.error(err); // Afficher l'erreur dans la console pour le débogage
      interaction.followUp({
        content: "Erreur lors de la récupération du calendrier.",
        ephemeral: true,
      });
    }
  },
};
