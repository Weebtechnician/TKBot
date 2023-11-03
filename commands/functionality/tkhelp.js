const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tkhelp")
    .setDescription("Shows information about the teamkill commands"),

  async execute(interaction) {
    const response = `
**Teamkill Command Information:**

**/tkadd**: Adds a teamkill to the database.
  - Required fields:
    - **killer**: The Discord user who performed the teamkill. 
    - **victim**: The Discord user who was killed. 
    - **explanation**: An explanation for the teamkill. 
  - Optional fields:
    - **video**: A URL to a video related to the teamkill. 

**/tkdelete**: Deletes teamkills from the database.
  - Optional fields (choose one):
    - **id**: The ID of the teamkill to be deleted. 
    - **user**: The Discord user whose teamkills should be deleted.
    - **all**: Deletes all teamkills from the database.

**/tkedit**: Edits an existing teamkill in the database.
  - Required fields:
    - **id**: The ID of the teamkill to be edited. 
  - Optional fields:
    - **killer**: The new Discord user who performed the teamkill. 
    - **victim**: The new Discord user who was killed. 
    - **explanation**: The new explanation for the teamkill. 
    - **video**: A new URL to a video related to the teamkill. 

**/tklist**: Lists all teamkills or all teamkills from one individual.
  - Options:
    - **user**: The Discord user whose teamkills should be listed. 
    - **all**: Lists all teamkills from the database.

**/tkleaderboard**: Shows the leaderboard for people with the highest teamkills.
    `;
    await interaction.reply(response);
  },
};
