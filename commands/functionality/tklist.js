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

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const user = interaction.options.getUser("user");
    const all = interaction.options.getBoolean("all");

    let filter = { guildId: guildId }; // Always include guildId in the filter

    if (user) {
      filter.killer = user.username; // Add killer to filter if user is provided
    } else if (!all) {
      await interaction.reply(
        "Please specify a user or choose to list all records."
      );
      return;
    }

    try {
      const teamKills = await TeamKill.find(filter);

      if (teamKills.length === 0) {
        await interaction.reply("No teamkill records found.");
        return;
      }

      let response = "List of TeamKills:\n";

      teamKills.forEach((teamKill) => {
        response += `ID: ${teamKill.customId}\nKiller: ${teamKill.killer}\nVictim: ${teamKill.victim}\nExplanation: ${teamKill.explanation}\nTime: ${teamKill.time}\n`;

        if (teamKill.video) {
          response += `Video: ${teamKill.video}\n\n`;
        } else {
          response += "\n";
        }
      });

      await interaction.reply(response);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "There was an error trying to list the teamkill records."
      );
    }
  },
};
