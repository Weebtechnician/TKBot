// Import environment variables from .env file
require("dotenv").config();

// Import required packages
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

// Connect to MongoDB using credentials from environment variables
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import TeamKill model
const TeamKill = require("../../models/teamKillModel.js");

// Export the module
module.exports = {
  // Define command structure
  data: new SlashCommandBuilder()
    .setName("tkdelete")
    .setDescription("Delete a teamkill record from the database")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The ID of the teamkill record to delete")
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Delete all teamkill records associated with this user")
    )
    .addBooleanOption((option) =>
      option
        .setName("all")
        .setDescription("Delete all teamkill records from the database")
    ),

  // Define command execution logic
  async execute(interaction) {
    // Extract guild ID
    const guildId = interaction.guildId;

    // Initialize filter with guild ID
    let filter = { guildId: guildId };

    // Extract options from the interaction
    const id = interaction.options.getInteger("id");
    const user = interaction.options.getUser("user");
    const all = interaction.options.getBoolean("all");

    // Handle the case where ID is provided
    if (id) {
      filter.customId = id;
      try {
        const result = await TeamKill.deleteOne(filter);

        if (result.deletedCount > 0) {
          await interaction.reply(
            `Teamkill record with ID ${id} has been deleted.`
          );
        } else {
          await interaction.reply(`No teamkill record found with ID ${id}.`);
        }
      } catch (error) {
        // Log and reply with an error message in case of an exception
        console.error(error);
        await interaction.reply(
          "There was an error trying to delete the teamkill record."
        );
      }
    }

    // Handle the case where a user is specified
    else if (user) {
      filter.killer = user.username;
      try {
        const result = await TeamKill.deleteMany(filter);

        if (result.deletedCount > 0) {
          await interaction.reply(
            `${result.deletedCount} teamkill record(s) associated with user ${user.username} have been deleted.`
          );
        } else {
          await interaction.reply(
            `No teamkill records found associated with user ${user.username}.`
          );
        }
      } catch (error) {
        console.error(error);
        await interaction.reply(
          "There was an error trying to delete the teamkill records."
        );
      }
    }

    // Handle the case where all records are to be deleted
    else if (all) {
      try {
        const result = await TeamKill.deleteMany(filter);
        await interaction.reply(
          `${result.deletedCount} teamkill record(s) have been deleted.`
        );
      } catch (error) {
        console.error(error);
        await interaction.reply(
          "There was an error trying to delete all teamkill records."
        );
      }
    }

    // Reply with an error message if none of the above cases are met
    else {
      await interaction.reply(
        "Please specify an ID, user, or choose to delete all records."
      );
    }
  },
};
