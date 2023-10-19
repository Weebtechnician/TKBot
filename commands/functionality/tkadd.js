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

  async execute(interaction) {
    const killer = interaction.options.getUser("killer");
    const victim = interaction.options.getUser("victim");
    const explanation = interaction.options.getString("explanation");
    const video = interaction.options.getString("video");
    const guildId = interaction.guildId;
    const time = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    });
    const count = await TeamKill.countDocuments();
    const customId = count + 1;

    if (video && !isValidUrl(video)) {
      await interaction.reply("Please provide a valid video URL.");
      return;
    }

    const teamKill = new TeamKill({
      customId: customId,
      killer: killer.username,
      victim: victim.username,
      explanation: explanation,
      video: video,
      time: time,
      guildId: guildId,
    });

    await teamKill.save();

    let response = `${killer} killed ${victim} on ${time}. Explanation: ${explanation}`;

    if (video) {
      response += `\nVideo: ${video}`;
    }

    await interaction.reply(response);
  },
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
