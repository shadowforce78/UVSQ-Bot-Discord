const client = require("../index");
const fs = require("fs");
const classeDB = require('../../db.json')

client.on("interactionCreate", async (interaction) => {
  // Slash Command Handling
  if (interaction.isCommand()) {
    await interaction.deferReply({ ephemeral: false }).catch(() => { });

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.followUp({ content: "An error has occured " });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    const userperm = interaction.member.permissions.has(cmd.userperm);

    if (!userperm) {
      return interaction.followUp({
        content: `You need \`${cmd.userperm || []}\` Permissions`,
      });
    }

    const botperm = interaction.guild.me.permissions.has(cmd.botperm);
    if (!botperm) {
      return interaction.followUp({
        content: `I need \`${cmd.botperm || []}\` Permissions`,
      });
    }
    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id,
    );

    cmd.run(client, interaction, args);
  }

  // Context Menu Handling
  if (interaction.isContextMenu()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }

  if (interaction.isButton()) {
    let user = interaction.user.id;
    let userDB = classeDB[user];

    // Si l'utilisateur n'a pas de classe
    if (!userDB) {
      return interaction.followUp({
        content: "Vous n'avez pas de classe définie !\nVeuillez définir votre classe avec la commande `/classe`",
      });
    }

    const userID = interaction.user.id;
    if (interaction.customId === "daily") {
      classe.findOneAndUpdate(
        { id: userID },
        { dailyReminder: true },
        { upsert: true },
        function (err, doc) {
          if (err) {
            console.log(err);
          }
        },
      );

      interaction.reply({
        content: `Daily Reminder Set for <@!${userID}>`,
        ephemeral: true,
      });
    }

    if (interaction.customId === "weekly") {
      classe.findOneAndUpdate(
        { id: userID },
        { weeklyReminder: true },
        { upsert: true },
        function (err, doc) {
          if (err) {
            console.log(err);
          }
        },
      );

      interaction.reply({
        content: `Weekly Reminder Set for <@!${userID}>`,
        ephemeral: true,
      });
    }

    if (interaction.customId === "disable") {
      classe.findOneAndUpdate(
        { id: userID },
        { dailyReminder: false, weeklyReminder: false },
        { upsert: true },
        function (err, doc) {
          if (err) {
            console.log(err);
          }
        },
      );

      interaction.reply({
        content: `Reminder Disabled for <@!${userID}>`,
        ephemeral: true,
      });
    }
  }
});
