const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// メモリに一時保存するキャッシュ
client.cache = {};

function mask(text) {
  return '*'.repeat(text.length);
}

client.on(Events.InteractionCreate, async interaction => {
  // Slash Command
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

      await interaction.reply({
        content:
          `Token: ${mask(token)}\n` +
          `Token ID: ${mask(tokenId)}\n` +
          `From: ${interaction.user.tag}`,
        components: [row],
        ephemeral: true
      });
    }
  }

  // ボタン処理
  if (interaction.isButton()) {
    const [_, type, id] = interaction.customId.split('_');

    const data = client.cache[id];
    if (!data) {
      return interaction.reply({
        content: 'The deta was not found',
        ephemeral: true
      });
    }

    // ログ送信
    const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logChannel) {
      logChannel.send(
        `[COPY LOG]\n` +
        `User: ${interaction.user.tag}\n` +
        `Part that they copied: ${type.toUpperCase()}\n` +
        `Time＆Date: <t:${Math.floor(Date.now() / 1000)}:F>`
      );
    }

    // 本物を本人にだけ表示
    if (type === 'token') {
      return interaction.reply({
        content: `Token: ${data.token}`,
        ephemeral: true
      });
    }

    if (type === 'tokenid') {
      return interaction.reply({
        content: `Token ID: ${data.tokenId}`,
        ephemeral: true
      });
    }
  }
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in: ${client.user.tag}`);
});

client.login(process.env.TOKEN);