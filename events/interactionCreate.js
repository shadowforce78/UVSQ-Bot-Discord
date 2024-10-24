const client = require("../index");
const fs = require("fs");
const classeDB = require("../db.json");

const { getCalendar, getEvent } = require("../EDTFunction/getCalendar");
const { generateImage } = require("../EDTFunction/generateImage.js");

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



		// CHANGEMENT DE JOUR
		if (interaction.customId === `previous`) {

			function formatDateForFileName(dateStr) {
				const date = new Date(dateStr);
				const day = String(date.getDate()).padStart(2, '0');
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const year = date.getFullYear();
				return `${day}-${month}-${year}`;
			}
		
			const nbDeJour = classeDB[userID].lastRequest[0];
			const startDate = classeDB[userID].lastRequest[1];
		
			const newStart = new Date(startDate);
			const newEnd = new Date(startDate);
		
			newStart.setDate(newStart.getDate() - 1);
			newEnd.setDate(newEnd.getDate() - 1);
		
			const newStartString = newStart.toISOString().split('T')[0];
			const newEndString = newEnd.toISOString().split('T')[0];
		
			const classe = classeDB[userID].classe;
			if (nbDeJour > 1) {
				return interaction.reply({
					content: "Vous ne pouvez pas demander le jour précédent si vous avez demandé plus d'un jour",
					ephemeral: true,  // Réponse invisible pour les autres utilisateurs (optionnel)
				});
			}
		
			const calendarRes = await getCalendar(newStartString, newEndString, classe);
			const eventDetails = await Promise.all(
				calendarRes.map((event) => getEvent(event.id))
			);
			const eventDetailsArray = Object.values(eventDetails);
		
			if (eventDetailsArray.length === 0) {
				return interaction.reply({
					content: "Aucun cours trouvé pour cette période.",
					ephemeral: true,
				});
			}
		
			const startDateFormatted = formatDateForFileName(newStartString);
			const endDateFormatted = formatDateForFileName(newEndString);
			const fileName = `./EDTsaves/${classe}-${startDateFormatted}-${endDateFormatted}-image.png`;

			// Mis à jour de lastRequest
			classeDB[userID].lastRequest = [nbDeJour - 1, newStartString];
		
			if (!fs.existsSync(fileName)) {
				await generateImage(classe, eventDetailsArray);
			}

			// Bouton d'interaction pour changer de jour
            const row = {
                type: "ACTION_ROW",
                components: [
                    {
                        type: "BUTTON",
                        label: "Jour précédent",
                        style: "PRIMARY",
                        customId: `previous`,
                    },
                    {
                        type: "BUTTON",
                        label: "Jour suivant",
                        style: "PRIMARY",
                        customId: `next`,
                    },
                ],
            };
		
			// Supprimer l'interaction originale
			await interaction.message.delete();
		
			// Envoyer un nouveau message avec le fichier joint
			await interaction.channel.send({
				files: [fileName],
				components: [row],
			});
		}


		if (interaction.customId === `next`) {

			function formatDateForFileName(dateStr) {
				const date = new Date(dateStr);
				const day = String(date.getDate()).padStart(2, '0');
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const year = date.getFullYear();
				return `${day}-${month}-${year}`;
			}
		
			const nbDeJour = classeDB[userID].lastRequest[0];
			const startDate = classeDB[userID].lastRequest[1];
		
			const newStart = new Date(startDate);
			const newEnd = new Date(startDate);
		
			newStart.setDate(newStart.getDate() + 1);
			newEnd.setDate(newEnd.getDate() + 1);
		
			const newStartString = newStart.toISOString().split('T')[0];
			const newEndString = newEnd.toISOString().split('T')[0];
		
			const classe = classeDB[userID].classe;
			if (nbDeJour > 1) {
				return interaction.reply({
					content: "Vous ne pouvez pas demander le jour précédent si vous avez demandé plus d'un jour",
					ephemeral: true,  // Réponse invisible pour les autres utilisateurs (optionnel)
				});
			}
		
			const calendarRes = await getCalendar(newStartString, newEndString, classe);
			const eventDetails = await Promise.all(
				calendarRes.map((event) => getEvent(event.id))
			);
			const eventDetailsArray = Object.values(eventDetails);
		
			if (eventDetailsArray.length === 0) {
				return interaction.reply({
					content: "Aucun cours trouvé pour cette période.",
					ephemeral: true,
				});
			}
		
			const startDateFormatted = formatDateForFileName(newStartString);
			const endDateFormatted = formatDateForFileName(newEndString);
			const fileName = `./EDTsaves/${classe}-${startDateFormatted}-${endDateFormatted}-image.png`;

			// Mis à jour de lastRequest
			classeDB[userID].lastRequest = [nbDeJour - 1, newStartString];
		
			if (!fs.existsSync(fileName)) {
				await generateImage(classe, eventDetailsArray);
			}

			// Bouton d'interaction pour changer de jour
            const row = {
                type: "ACTION_ROW",
                components: [
                    {
                        type: "BUTTON",
                        label: "Jour précédent",
                        style: "PRIMARY",
                        customId: `previous`,
                    },
                    {
                        type: "BUTTON",
                        label: "Jour suivant",
                        style: "PRIMARY",
                        customId: `next`,
                    },
                ],
            };
		
			// Supprimer l'interaction originale
			await interaction.message.delete();
		
			// Envoyer un nouveau message avec le fichier joint
			await interaction.channel.send({
				files: [fileName],
				components: [row],
			});
		}
		
	}
});
