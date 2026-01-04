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

    const message = `**${interaction.user.tag}** has sent the token`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('show_token')
        .setLabel('Show it')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: message,
      components: [row]
    });

    // ボタン押されたとき
    const filter = i => i.customId === 'show_token' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {

      // ログ送信
      try {
        const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
        await logChannel.send(
          `[COPY LOG]\n` +
          `User: ${i.user.tag}\n` +
          `Copied: TOKEN + TOKEN ID\n` +
          `Channel: #${i.channel?.name || 'Unknown'}\n` +
          `Time: <t:${Math.floor(Date.now() / 1000)}:F>`
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
