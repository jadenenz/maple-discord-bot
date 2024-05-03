const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { fetchExp } = require("./../../helpers/fetchExp")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exp")
    .setDescription("Fetches exp for the set list of IGNs"),
  async execute(interaction) {
    try {
      const ignList = [
        "wizyori",
        "jeraie",
        "shlop",
        "traemon",
        "meleeking",
        "kinkflip",
        "salary",
        "plimbotoilet",
        "camperdown",
        "outer",
        "boredy",
        "biepo",
        "moonlemon",
      ]
      await interaction.deferReply()
      const sortedExp = await fetchExp(ignList)

      // const expEmbed = new EmbedBuilder()
      //   .setColor(0x0099ff)
      //   .setTitle("Flurm")
      //   .setDescription("Exp fetched from MapleRanks")
      //   .addFields(
      //     {
      //       name: `1st: ${sortedExp[0].name}`,
      //       value: sortedExp[0].number,
      //     },
      //     { name: `2nd: ${sortedExp[1].name}`, value: sortedExp[1].number }
      //   )
      //   .setTimestamp()
      //   .setFooter({ text: "Meow" })

      const expEmbed = {
        color: 0x0099ff,
        title: "Flurm105",
        description: "Exp fetched from MapleRanks",
        fields: [
          // {
          //   name: `1st: ${sortedExp[0].name}`,
          //   value: sortedExp[0].number,
          // },
          // { name: `2nd ${sortedExp[1].name}`, value: sortedExp[1].number },
          // { name: `3rd ${sortedExp[2].name}`, value: sortedExp[2].number },
        ],
        timestamp: new Date().toISOString(),
      }

      sortedExp.forEach((element) => {
        expEmbed.fields.push({
          name: element.name,
          value: element.number,
        })
      })

      await interaction.editReply({ embeds: [expEmbed] })
    } catch (error) {
      console.error(error)
    }
  },
}
