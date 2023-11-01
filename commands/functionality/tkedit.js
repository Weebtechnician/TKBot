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
  // Defining the structure of the command with options
  data: new SlashCommandBuilder()
    .setName("tkedit")
    .setDescription("Edits a teamkill in the database")
    .addNumberOption((option) =>
      option
        .setName("id")
        .setDescription("The ID of the teamkill record to edit")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("killer").setDescription("The killer").setRequired(false)
    )
    .addUserOption((option) =>
      option.setName("victim").setDescription("The victim").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("explanation")
        .setDescription("Explanation of the incident")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("video")
        .setDescription("Attach a video to the teamkill")
        .setRequired(false)
    ),

  // Execution logic of the command
  async execute(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.options.getNumber("id");
    const killer = interaction.options.getUser("killer");
    const victim = interaction.options.getUser("victim");
    const explanation = interaction.options.getString("explanation");
    const video = interaction.options.getString("video");

    // Creating a filter for database query
    let filter = { guildId: guildId, customId: customId };

    // Validating video URL
    if (video && !isValidUrl(video)) {
      await interaction.reply("Please provide a valid video URL.");
      return;
    }

    // Validating input options
    if (!killer && !victim && !explanation && !video) {
      await interaction.reply(
        "You must specify a killer, victim, explanation or video."
      );
      return;
    }

    // Preparing update object based on provided options
    const update = {};
    if (killer) update["killer"] = killer.username;
    if (victim) update["victim"] = victim.username;
    if (explanation) update["explanation"] = explanation;
    if (video) update["video"] = video;

    // Listing the fields being updated for response message
    const updateFields = Object.keys(update).join(", ");

    try {
      // Updating the teamkill record in the database
      const result = await TeamKill.updateOne(filter, update);

      // Providing feedback on the updated fields
      if (result.matchedCount > 0) {
        await interaction.reply(
          `Teamkill record with ID ${customId} has been edited. Updated fields: ${updateFields}`
        );
      } else {
        await interaction.reply("No teamkill record found with the given ID.");
      }
    } catch (error) {
      // Logging the error
      console.error("Error editing teamkill record: ", error);

      // Sending error response
      await interaction.reply(
        "An error occurred while editing the teamkill record."
      );
    }
  },
};

// Function to validate the URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
