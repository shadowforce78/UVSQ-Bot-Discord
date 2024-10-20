const client = require("../index");
const fs = require("fs");
const classeDB = require("../db.json");

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
			interaction.user.id
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
		let userID = interaction.user.id;
		let userDB = classeDB[userID];

		// Si l'utilisateur n'a pas de classe
		if (!userDB) {
			return interaction.followUp({
				content:
					"Vous n'avez pas de classe définie !\nVeuillez définir votre classe avec la commande `/classe`",
			});
		}

		// Change the value of dailyReminder and weeklyReminder in the database to true
		if (interaction.customId === "daily") {
			if (classeDB[userID].dailyReminder == true) {
				classeDB[userID].dailyReminder = false;
				interaction.reply({
					content: `Daily Reminder Disabled for <@!${userID}>`,
					ephemeral: true,
				});
			} else {
				classeDB[userID].dailyReminder = true;
				interaction.reply({
					content: `Daily Reminder Set for <@!${userID}>`,
					ephemeral: true,
				});
			}

			// Save the database
			fs.writeFileSync("./db.json", JSON.stringify(classeDB, null, 2));
		}

		if (interaction.customId === "weekly") {
			if (classeDB[userID].weeklyReminder == true) {
				classeDB[userID].weeklyReminder = false;
				interaction.reply({
					content: `Weekly Reminder Disabled for <@!${userID}>`,
					ephemeral: true,
				});
			} else {
				classeDB[userID].weeklyReminder = true;

				interaction.reply({
					content: `Weekly Reminder Set for <@!${userID}>`,
					ephemeral: true,
				});
			}

			// Save the database
			fs.writeFileSync("./db.json", JSON.stringify(classeDB, null, 2));
		}

		if (interaction.customId === "disable") {
			classeDB[userID].dailyReminder = false;
			classeDB[userID].weeklyReminder = false;

			// Save the database
			fs.writeFileSync("./db.json", JSON.stringify(classeDB, null, 2));

			interaction.reply({
				content: `Reminder Disabled for <@!${userID}>`,
				ephemeral: true,
			});
		}
	}
});
