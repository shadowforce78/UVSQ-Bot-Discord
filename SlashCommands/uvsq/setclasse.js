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
      "INF1-A",
      "INF1-B",
      "INF1-C",
      "INF2-A FI",
      "INF2-B FI",
      "INF2-A FA",
      "INF2-B FA",
      "INF3-A FI",
      "INF3-B FI",
      "INF3-A FA",
      "INF3-B FA",
    ];

    const classeUser = interaction.options.getString("classe");

    const data = await schemaClasse.findOne({ id: interaction.user.id });
    if (!data) {
      await schemaClasse.create({
        id: interaction.user.id,
        classe: classeUser,
      });
    } else {
      await schemaClasse.findOneAndUpdate({ id: interaction.user.id }, {
        classe: classeUser,
      });
    }

    if (!classe.includes(classeUser)) {
      return interaction.followUp({
        content:
          "La classe n'est pas valide\nVeuillez choisir une classe parmi les suivantes : INF1-A, INF1-B, INF1-C, INF2-A FI, INF2-B FI, INF2-A FA, INF2-B FA, INF3-A FI, INF3-B FI, INF3-A FA, INF3-B FA",
      });
    } else {
      interaction.followUp({
        content: `Votre classe a été définie sur ${classeUser}`,
      });
    }
  },
};
