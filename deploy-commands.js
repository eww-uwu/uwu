const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send Token and Token ID")
    .addStringOption(option =>
      option.setName("token")
        .setDescription("Enter your Token")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("token_id")
        .setDescription("Enter your Token ID")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands("あなたのBotのID"),
      { body: commands }
    );
    console.log("✅ スラッシュコマンド登録完了");
  } catch (err) {
    console.error("❌ コマンド登録エラー:", err);
  }
})();