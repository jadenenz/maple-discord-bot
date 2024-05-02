const { SlashCommandBuilder } = require("discord.js")
const { fetchExp } = require("./../../helpers/fetchExp")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exp")
    .setDescription("Fetches exp for the set list of IGNs"),
  async execute(interaction) {
    const sortedExp = await fetchExp()
    await interaction.reply(`Sorted EXP: ${JSON.stringify(sortedExp)}`)
  },
}
