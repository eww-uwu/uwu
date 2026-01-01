const http = require("http");
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.end("OK");
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Discord Bot
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const TARGETCHANNELID = "1452029983961649243";

const ALLOWEDROLEID = "1448702292982501570";

// Finish instantly when there isn't token
if (!process.env.TOKEN) {
  console.error("ERROR: TOKEN isn't configured（process.env.TOKEN is undefined）");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.on("ready", () => {
  console.log(`Logged in: ${client.user.tag}`);
});

// /send
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "send") return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.roles.cache.has(ALLOWEDROLEID)) {
    return interaction.reply({
      content: "You have no permission to use this command",
      ephemeral: true
    });
  }

  const token = interaction.options.getString("token");
  const tokenId = interaction.options.getString("token_id");
  const sender = `${interaction.user.tag}`;

  const channel = await client.channels.fetch(TARGETCHANNELID);
  await channel.send(`TOKEN: ${token}\nTOKEN_ID: ${tokenId}\nfrom ${sender}`);

  await interaction.reply({ content: "Your token has been sent", ephemeral: true });
});

// Discord Log in
client.login(process.env.TOKEN).catch(err => {
  console.error("Discord Log in Error:", err);
  process.exit(1);
});