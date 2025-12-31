const http = require("http");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// 環境変数PORTを使用し、HTTPサーバーをセットアップ
const PORT = process.env.PORT || 8000;

http.createServer((req, res) => {
  res.end("Bot is running!");
}).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Discordクライアントのセットアップ
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
});

// Discordへのログイン処理（Koyebの環境変数 DISCORD_TOKEN を使用）
client.login(process.env.DISCORD_TOKEN);
