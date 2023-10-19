require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const TeamKill = require("../../models/teamKillModel.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tkleaderboard")
    .setDescription("Lists leaderboard of all teamkill records"),

  async execute(interaction) {
    const guildId = interaction.guildId;
    try {
      const leaderboard = await TeamKill.aggregate([
        { $match: { guildId: guildId } },
        { $group: { _id: "$killer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      if (leaderboard.length === 0) {
        await interaction.reply("No teamkill records found.");
        return;
      }

      let response = "TeamKill Leaderboard:\n";
      leaderboard.forEach((entry, index) => {
        response += `${index + 1}. ${entry._id} - ${entry.count}\n`;
      });

      await interaction.reply(response);
    } catch (error) {
      console.error("Error fetching the teamkill leaderboard.", error);
      await interaction.reply(
        "There was an error trying to fetch the teamkill leaderboard."
      );
    }
  },
};
