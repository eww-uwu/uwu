require("dotenv").config();
const http = require("http");

// 簡易サーバー（RenderやReplitなどの生存確認用）
http.createServer((req, res) => {
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

// 環境変数からIDを取得
const SEND_CHANNEL_ID = process.env.SEND_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

client.on(Events.InteractionCreate, async (interaction) => {
  // --- 1. スラッシュコマンド [/send] の処理 ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'send') {
    const token = interaction.options.getString('token');
    const tokenId = interaction.options.getString('token_id');

    // CustomIDは100文字制限があるため、長い場合はエラーになるリスクがあります
    // ここでは安全のため、簡易的に「token:」を接頭辞にして連結します
    const customId = `show_token:${token}:${tokenId}`;

    if (customId.length > 100) {
      return await interaction.reply({
        content: "エラー：トークンが長すぎます。CustomIDの100文字制限を超えました。",
        flags: 64
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel('Copy token')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      const sendChannel = await client.channels.fetch(SEND_CHANNEL_ID);
      await sendChannel.send({
        content: `**${interaction.user.tag}** がトークンを発行しました。`,
        components: [row]
      });

      await interaction.reply({ content: "送信完了しました。", flags: 64 });
    } catch (error) {
      console.error("送信エラー:", error);
      await interaction.reply({ content: "送信に失敗しました。チャンネルIDを確認してください。", flags: 64 });
    }
  }

  // --- 2. ボタン入力の一括処理 (コレクターなし / 半永久) ---
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('show_token:')) {
      // データの取り出し (最初の ':' 以降を分割)
      const parts = interaction.customId.split(':');
      const token = parts[1];
      const tokenId = parts[2];

      try {
        // ログ出力処理
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        const unix = Math.floor(Date.now() / 1000);

        await logChannel.send({
          content: `[Copy Log]\n` +
                   `実行者: ${interaction.user.tag} (${interaction.user.id})\n` +
                   `メッセージ: ${interaction.message.url}\n` +
                   `時間: <t:${unix}:F>`
        });

        // ユーザーにだけ見えるメッセージでトークンを表示
        await interaction.reply({
          content: `**Token:** \`${token}\` \n**Token ID:** \`${tokenId}\``,
          flags: 64
        });
      } catch (error) {
        console.error("ボタン処理エラー:", error);
        // 万が一ログ送信に失敗しても、本人への返信は試みる
        if (!interaction.replied) {
          await interaction.reply({ content: "処理中にエラーが発生しました。", flags: 64 });
        }
      }
    }
  }
});

client.once(Events.ClientReady, () => {
  console.log(`2026年稼働確認済み - Logged in: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
