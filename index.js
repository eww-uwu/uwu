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

// 送信先チャンネルID
const TARGET_CHANNEL_ID = "1452029983961649243";

// 使っていいロールID（ここを変更）
const ALLOWED_ROLE_ID = "1448702292982501570";

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
// /send コマンド処理（ロール制限付き）
// ===============================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "send") return;

  // ロールチェック（ここで ALLOWED_ROLE_ID を使う）
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
    return interaction.reply({
      content: "You have no permission to use this command",
      ephemeral: true
    });
  }

  // ここから通常処理
  const token = interaction.options.getString("token");
  const tokenId = interaction.options.getString("token_id");
  const sender = `${interaction.user.tag}`;

  const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
  await channel.send(`TOKEN: ${token}\nTOKEN_ID: ${tokenId}\nfrom ${sender}`);

  await interaction.reply({ content: "Your token has been sent", ephemeral: true });
});

// ===============================
// Discord Log in
// ===============================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Discord Log in Error:", err);
  process.exit(1);
});