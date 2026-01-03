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
  Events,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// 一時キャッシュ
client.cache = {};

function mask(text) {
  return '*'.repeat(text.length);
}

client.on(Events.InteractionCreate, async interaction => {
  // ============================
  //   Slash Command: /send
  // ============================
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'send') {
      const token = interaction.options.getString('token');
      const tokenId = interaction.options.getString('token_id');

      const uniqueId = interaction.id;
      client.cache[uniqueId] = { token, tokenId };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`copy_token_${uniqueId}`)
          .setLabel('Copy Token')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`copy_tokenid_${uniqueId}`)
          .setLabel('Copy Token ID')
          .setStyle(ButtonStyle.Secondary)
      );

      const embed = new EmbedBuilder()
        .setTitle("Token Information")
        .setDescription(
          `**Token:** ${mask(token)}\n` +
          `**Token ID:** ${mask(tokenId)}\n` +
          `**From:** ${interaction.user.tag}`
        )
        .setColor("Blue");

      // fetch で確実にチャンネル取得
      let sendChannel;
      try {
        sendChannel = await client.channels.fetch(process.env.SEND_CHANNEL_ID);
      } catch (e) {
        return interaction.reply({
          content: "Channel is not found",
          flags: 64
        });
      }

      // 全体公開で送信
      await sendChannel.send({
        embeds: [embed],
        components: [row]
      });

      // コマンド実行者には完了メッセージ（reply は1回だけ）
      return interaction.reply({
        content: "Your token has been sent",
        flags: 64
      });
    }
  }

  // ============================
  //   ボタン処理
  // ============================
  if (interaction.isButton()) {
    const [_, type, id] = interaction.customId.split('_');

    const data = client.cache[id];
    if (!data) {
      return interaction.reply({
        content: 'Data is not found',
        flags: 64
      });
    }

    // ログ送信（fetchで確実に取得）
    try {
      const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
      await logChannel.send(
        `[COPY LOG]\n` +
        `User: ${interaction.user.tag}\n` +
        `Copied: ${type.toUpperCase()}\n` +
        `Time: <t:${Math.floor(Date.now() / 1000)}:F>`
      );
    } catch (e) {
      console.log("Log channel fetch failed:", e);
    }

    // 本物を本人だけに表示
    if (type === 'token') {
      return interaction.reply({
        content: `Token: ${data.token}`,
        flags: 64
      });
    }

    if (type === 'tokenid') {
      return interaction.reply({
        content: `Token ID: ${data.tokenId}`,
        flags: 64
      });
    }
  }
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
