const mongoose = require("mongoose");

module.exports = mongoose.model(
  "classe",
  new mongoose.Schema({
    id: String,
    classe: String,
    dailyReminder: Boolean,
    weeklyReminder: Boolean,
  }),
);
