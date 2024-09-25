const client = require("../index.js");
const classe = require('../schema/classe.js')

client.on('ready', async () => {
    const data = await classe.findOne({ id: interaction.user.id });
    const classe = data.classe || 'INF1-B';
    const dailyReminder = data.dailyReminder || false;
    const weeklyReminder = data.weeklyReminder || false;
});