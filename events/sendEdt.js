const client = require("../index.js");
const schemaClasse = require("../schema/classe.js");

client.on("ready", async () => {
    // const data = await schemaClasse.findOne({ id: interaction.user.id });
    // if (!data) {
    //     return;
    // }
    const userID = "918916801994309752";
    const user = await client.users.fetch(userID);
    // const classe = data.classe;
    // const dailyReminder = data.dailyReminder;
    // const weeklyReminder = data.weeklyReminder;

    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    let dateDebut;
    let endDate;

    if (day !== 1) { // If today is not a Monday
        const diff = today.getDate() - day + 1;
        dateDebut = new Date(today.setDate(diff));
    } else {
        dateDebut = today;
    }

    endDate = new Date(dateDebut);
    endDate.setDate(endDate.getDate() + 4); // Friday

    dateDebut = dateDebut.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    endDate = endDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD

    // console.log(dateDebut);
    // console.log(endDate);

});
