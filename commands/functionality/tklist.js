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
    .setName("tklist")
    .setDescription("Lists all teamkill records")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("List all teamkill records associated with this user")
    )
    .addBooleanOption((option) =>
      option.setName("all").setDescription("List all teamkill records")
    ),

  // Execution logic for the command
  async execute(interaction) {
    // Getting the guild ID from the interaction object
    const guildId = interaction.guild.id;

    // Retrieving user and all options from the interaction
    const user = interaction.options.getUser("user");
    const all = interaction.options.getBoolean("all");

    // Defining the initial filter with guildId
    let filter = { guildId: guildId };

    // If a user is specified, add the user to the filter
    if (user) {
      filter.killer = user.username;
    }
    // If no user is specified and the all option is not true, reply with an error message
    else if (!all) {
      await interaction.reply(
        "Please specify a user or choose to list all records."
      );
      return;
    }

    try {
      // Retrieve teamkill records based on the filter criteria
      const teamKills = await TeamKill.find(filter);

      // If no teamkill records are found, reply with a message indicating this
      if (teamKills.length === 0) {
        await interaction.reply("No teamkill records found.");
        return;
      }

      // Building the response string with teamkill record details
      let response = "List of TeamKills:\n";
      teamKills.forEach((teamKill) => {
        response += `ID: ${teamKill.customId}\nKiller: ${teamKill.killer}\nVictim: ${teamKill.victim}\nExplanation: ${teamKill.explanation}\nTime: ${teamKill.time}\n`;

        if (teamKill.video) {
          response += `Video: ${teamKill.video}\n\n`;
        } else {
          response += "\n";
        }
      });

      // Sending the response containing teamkill records
      await interaction.reply(response);
    } catch (error) {
      // Logging the error and sending an error response in case of an exception
      console.error(error);
      await interaction.reply(
        "There was an error trying to list the teamkill records."
      );
    }
  },
};
