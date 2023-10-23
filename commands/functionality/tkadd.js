// Loading environment variables from .env file
require("dotenv").config();

// Importing required packages and modules
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

// Connecting to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importing the TeamKill model
const TeamKill = require("../../models/teamKillModel.js");

// Exporting the module
module.exports = {
  // Command details
  data: new SlashCommandBuilder()
    .setName("tkadd")
    .setDescription("Adds a teamkill to the database")
    .addUserOption((option) =>
      option.setName("killer").setDescription("The killer").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("victim").setDescription("The victim").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("explanation")
        .setDescription("How the killer killed the victim")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("video")
        .setDescription("Attach a video to the teamkill")
        .setRequired(false)
    ),

  // Command execution logic
  async execute(interaction) {
    try {
      // Retrieving user options
      const killer = interaction.options.getUser("killer");
      const victim = interaction.options.getUser("victim");
      const explanation = interaction.options.getString("explanation");
      const video = interaction.options.getString("video");
      const guildId = interaction.guildId;

      // Validating video URL
      if (video && !isValidUrl(video)) {
        await interaction.reply("Please provide a valid video URL.");
        return;
      }

      // Getting the next available custom ID
      const customId = await getNextCustomId();

      // Getting the current time
      const time = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });

      // Creating a new TeamKill record
      const teamKill = new TeamKill({
        customId,
        killer: killer.username,
        victim: victim.username,
        explanation,
        video,
        time,
        guildId,
      });

      // Saving the TeamKill record to the database
      await teamKill.save();

      // Building response message
      let response = buildResponse(killer, victim, time, explanation, video);

      // Sending reply
      await interaction.reply(response);
    } catch (error) {
      // Logging any errors
      console.error("Error adding teamkill: ", error);

      // Sending error response
      await interaction.reply("An error occurred while adding the teamkill.");
    }
  },
};

// Function to get the next available custom ID
async function getNextCustomId() {
  // Counting existing documents to determine the next ID
  const count = await TeamKill.countDocuments();
  return count + 1;
}

// Function to validate the URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Function to build the response message
function buildResponse(killer, victim, time, explanation, video) {
  let response = `${killer} killed ${victim} on ${time}. Explanation: ${explanation}`;

  // Appending video URL to the response if available
  if (video) {
    response += `\nVideo: ${video}`;
  }

  return response;
}
