// Load environment variables from .env file
require("dotenv").config();

// Import required packages and modules
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the TeamKill model
const TeamKill = require("../../models/teamKillModel.js");

// Export the command module
module.exports = {
  // Define the structure of the command
  data: new SlashCommandBuilder()
    .setName("tkleaderboard")
    .setDescription("Lists leaderboard of all teamkill records"),

  // Execution logic for the command
  async execute(interaction) {
    const guildId = interaction.guildId;
    try {
      // Aggregate teamkills by killer, count them, and then sort them in descending order
      const leaderboard = await TeamKill.aggregate([
        { $match: { guildId: guildId } }, // Filter teamkills for the current guild
        { $group: { _id: "$killer", count: { $sum: 1 } } }, // Group by killer and count teamkills
        { $sort: { count: -1 } }, // Sort the results in descending order
      ]);

      // Check if leaderboard is empty
      if (leaderboard.length === 0) {
        await interaction.reply("No teamkill records found.");
        return;
      }

      // Constructing the response string for the leaderboard
      let response = "TeamKill Leaderboard:\n";
      leaderboard.forEach((entry, index) => {
        response += `${index + 1}. ${entry._id} - ${entry.count}\n`;
      });

      // Send the leaderboard response
      await interaction.reply(response);
    } catch (error) {
      // Log the error and send an error response
      console.error("Error fetching the teamkill leaderboard.", error);
      await interaction.reply(
        "There was an error trying to fetch the teamkill leaderboard."
      );
    }
  },
};
