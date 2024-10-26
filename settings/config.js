import { Colors } from "discord.js";

const settings = {
  TOKEN: process.env.TOKEN || "",
  PREFIX: process.env.PREFIX || "u!",
  Owners: ["918916801994309752"],
  Slash: {
    Global: true,
    GuildID: process.env.GuildID || "",
  },
  embed: {
    color: Colors.Blurple,
    wrongColor: Colors.Red,
  },
  emoji: {
    success: "✅",
    error: "❌",
  },
};

export default settings;
