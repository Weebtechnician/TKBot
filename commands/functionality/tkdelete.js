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

  async execute(interaction) {
    const guildId = interaction.guildId;
    let filter = { guildId: guildId };
    const id = interaction.options.getInteger("id");
    const user = interaction.options.getUser("user");
    const all = interaction.options.getBoolean("all");

    if (id) {
      filter.customId = id; // Add this line to include ID in the filter
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
        console.error(error);
        await interaction.reply(
          "There was an error trying to delete the teamkill record."
        );
      }
    } else if (user) {
      filter.killer = user.username; // Include the username in the filter while keeping the guildId
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
    } else if (all) {
      try {
        const result = await TeamKill.deleteMany(filter); // Just use filter with guildId to delete all records in the guild
        await interaction.reply(
          `${result.deletedCount} teamkill record(s) have been deleted.`
        );
      } catch (error) {
        console.error(error);
        await interaction.reply(
          "There was an error trying to delete all teamkill records."
        );
      }
    } else {
      await interaction.reply(
        "Please specify an ID, user, or choose to delete all records."
      );
    }
  },
};
