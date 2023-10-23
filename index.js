// Import environment variables from .env file
require("dotenv").config();

// Import required packages and modules
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
// Using Express because Heroku will close application if it's not a web app.
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(process.env.PORT || 5000, () => console.log("Server is ready."));

// Retrieve the Discord token from environment variables
const token = process.env.TOKEN;

// Create a new Discord client with the guilds intent
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Initialize a collection to store the commands
client.commands = new Collection();

// Read the command folders
const commandFolders = fs.readdirSync("./commands");

// Iterate through each command folder
for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, "commands", folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  // Iterate through each command file within the folder
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    // Check if the command has both a data and execute property
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Read event files
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

// Iterate through each event file
for (const file of eventFiles) {
  const event = require(path.join(__dirname, "events", file));

  // Check if the event should be executed once or multiple times
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Log in to Discord with the token
client.login(token);
