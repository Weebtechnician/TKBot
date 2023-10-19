const mongoose = require("mongoose");

const teamKillSchema = new mongoose.Schema({
  customId: {
    type: Number,
  },
  killer: {
    type: String,
  },
  victim: {
    type: String,
  },
  explanation: {
    type: String,
  },
  video: {
    type: String,
  },
  time: {
    type: String,
  },
  guildId: {
    type: String,
  },
});

const TeamKill = mongoose.model("TeamKill", teamKillSchema);

module.exports = TeamKill;
