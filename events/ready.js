const client = require("../index");

client.on(
    "ready",
    () => console.log(`${client.user.tag} is up and ready to go!`),
);

client.on("ready", () => {
    client.user.setActivity(`UVSQ Emploi Du Temps`, { type: "WATCHING" });
});
