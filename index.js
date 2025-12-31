// ===============================
// HTTP サーバー（Koyeb 用）
// ===============================
const http = require("http");

// Koyeb は固定ポート不可 → PORT を使う
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.end("OK");
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// ===============================
// Discord Bot
// ===============================
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// トークンが設定されていない場合は即終了
if (!process.env.TOKEN) {
  console.error("❌ ERROR: TOKEN が設定されていません（process.env.TOKEN が undefined）");
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
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!token") {
    return message.reply("Use !send {TOKEN}");
  }

  if (message.guild) return;
});

// ===============================
// Discord ログイン
// ===============================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Discord ログインエラー:", err);
  process.exit(1);
});