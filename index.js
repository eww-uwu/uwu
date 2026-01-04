require("dotenv").config();
require("http").createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(8000);

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

// ====== チャンネルIDの読み込み ======
const SEND_CHANNEL_ID = process.env.SEND_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// ====== Discord クライアント作成 ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ============================
//   /send コマンド
// ============================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'send') {
    const token = interaction.options.getString('token');
    const tokenId = interaction.options.getString('token_id');

    const message = `**${interaction.user.tag}** 's token`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('show_token')
        .setLabel('Copy token')
        .setStyle(ButtonStyle.Primary)
    );

    // 送信先チャンネルに送る
    const sendChannel = await client.channels.fetch(SEND_CHANNEL_ID);
    await sendChannel.send({
      content: message,
      components: [row]
    });

    // ユーザーには「送ったよ」とだけ返す
    await interaction.reply({
      content: "Your token has been sent",
      ephemeral: true
    });

    // ボタン押されたとき
    const filter = i => i.customId === 'show_token' && i.user.id === interaction.user.id;
    const collector = sendChannel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {

      // ログ送信
      try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        const unix = Math.floor(Date.now() / 1000);

        await logChannel.send(
          `[Copy Log]\n` +
          `User: ${i.user.tag}\n` +
          `Link: ${i.message.url}\n` +
          `Time: <t:${unix}:F>`
        );
      } catch (e) {
        console.log("Log channel fetch failed:", e);
      }

      // 本物を本人だけに表示
      await i.reply({
        content: `**Token:** ${token}\n**Token ID:** ${tokenId}`,
        ephemeral: true
      });
    });
  }
});

// ============================
//   Bot Ready
// ============================
client.once(Events.ClientReady, () => {
  console.log(`Logged in: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
