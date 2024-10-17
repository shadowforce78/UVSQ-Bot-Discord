const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const schemaClasse = require("../../schema/classe");

module.exports = {
  name: "classe",
  description: "Permet de définir la classe de l'utilisateur",
  userperm: [""],
  botperm: [""],
  options: [
    {
      name: "classe",
      description: "La classe de l'utilisateur (INF1-A, INF2-B, INF3-C)",
      type: "STRING",
      required: true,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const classe = [
      // Info
      "INF1-A1",
      "INF1-A2",
      "INF1-B1",
      "INF1-B2",
      "INF1-C1",
      "INF1-C2",
      "INF2-FA",
      "INF2-FI-A",
      "INF2-FI-B",
      "INF3-FA-A",
      "INF3-FA-B",
      "INF3-FI",
      // MMI
      "MMI1-A1",
      "MMI1-A2",
      "MMI1-B1",
      "MMI1-B2",
      "MMI2-A1",
      "MMI2-A2",
      "MMI2-B1",
      "MMI2-B2",
      // RT
      "RT1-FA",
      "RT1-FI-A1",
      "RT1-FI-A2",
      "RT1-FI-B1",
      "RT1-FI-B2",
      // GEII
      "GEII1-TDA1",
      "GEII1-TDA2",
      "GEII1-TDB1",
      "GEII1-TDB2",
      "GEII1-TDC",
      "GEII1-TP1",
      "GEII1-TP2",
      "GEII1-TP3",
    ];

    const classeUser = interaction.options.getString("classe");

    const data = await schemaClasse.findOne({ id: interaction.user.id });
    if (!data) {
      await schemaClasse.create({
        id: interaction.user.id,
        classe: classeUser,
      });
    } else {
      await schemaClasse.findOneAndUpdate(
        { id: interaction.user.id },
        {
          classe: classeUser,
        }
      );
    }

    if (!classe.includes(classeUser)) {
      return interaction.followUp({
        content:
          "La classe n'est pas valide\nVeuillez choisir une classe parmi les suivantes : \n`" +
          classe.join(",\n") +
          "`\n(si votre classe n'est pas dans la liste, veuillez contacter `saumondeluxe` pour l'ajouter)",
      });
    } else {
      interaction.followUp({
        content: `Votre classe a été définie sur ${classeUser}`,
      });
    }
  },
};
