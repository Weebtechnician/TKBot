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
    .setName("tkedit")
    .setDescription("Adds a teamkill to the database")
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
        .setDescription("What the fuck happened?")
        .setRequired(false)
    )

    .addStringOption((option) =>
      option
        .setName("video")
        .setDescription("Attach a video to the teamkill")
        .setRequired(false)
    ),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const customId = interaction.options.getNumber("id");
    const killer = interaction.options.getUser("killer");
    const victim = interaction.options.getUser("victim");
    const explanation = interaction.options.getString("explanation");
    const video = interaction.options.getString("video");

    let filter = { guildId: guildId, customId: customId };



    if (!killer && !victim && !explanation) {
      await interaction.reply(
        "You must specify a killer, victim, or explanation."
      );
      return;
    }

    const update = {};
    if (killer) update["killer"] = killer.username;
    if (victim) update["victim"] = victim.username;
    if (explanation) update["explanation"] = explanation;
    if (video) update["video"] = video;

    try {
      const result = await TeamKill.updateOne(filter, update);
      console.log(update);
      console.log(filter);

      if (result.matchedCount > 0) {
        await interaction.reply(
          `Teamkill record with ID ${customId} has been edited.`
        );
      } else {
        await interaction.reply(
          `No teamkill record found with ID ${customId}.`
        );
      }
      console.log(result);
    } catch (error) {
      console.error(
        "There was an error trying to edit the teamkill record.",
        error
      );
      await interaction.reply(
        "There was an error trying to edit the teamkill record."
      );
    }
  },
};
