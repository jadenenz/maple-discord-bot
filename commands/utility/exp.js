const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js")
const { fetchExp } = require("./../../helpers/fetchExp")
const { request } = require("undici")
const Canvas = require("@napi-rs/canvas")

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("exp")
    .setDescription("Fetches exp for the set list of IGNs"),
  async execute(interaction) {
    try {
      await interaction.deferReply()
      const sortedExp = await fetchExp()

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
        title: "Hole Exp Leaderboard",
        description: "Exp fetched from MapleRanks",
        fields: [],
        timestamp: new Date().toISOString(),
      }

      async function renderCanvas(winnersArray) {
        const canvas = Canvas.createCanvas(700, 350)
        const context = canvas.getContext("2d")
        const background = await Canvas.loadImage("./wallpaper.jpg")

        context.drawImage(background, 0, 0, canvas.width, canvas.height)

        // Array to store promises for image loading
        const imagePromises = []

        // Function to load an image and draw it on canvas
        async function loadImageAndDraw(character, x, y, width, height) {
          const response = await request(character.image)
          const imageBuffer = await response.body.arrayBuffer()
          const image = await Canvas.loadImage(imageBuffer)
          context.drawImage(image, x, y, width, height)
          context.font = "bold 22px Verdana"
          context.textAlign = "center"
          context.fillText(character.name, x + 75, y + 5)
        }

        imagePromises.push(loadImageAndDraw(winnersArray[0], 275, 25, 154, 154))
        imagePromises.push(loadImageAndDraw(winnersArray[1], 80, 65, 154, 154))
        imagePromises.push(loadImageAndDraw(winnersArray[2], 470, 80, 154, 154))
        await Promise.allSettled(imagePromises)

        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
          name: "ranking-image.png",
        })

        return attachment
      }

      //Loop backwards through sortedExp and remove any elements
      //that returned null, otherwise push to the embed array
      let tempArray = []
      for (let i = sortedExp.length - 1; i >= 0; i--) {
        if (sortedExp[i].name === null) {
          sortedExp.splice(i--, 1)
        } else {
          tempArray.push({
            name: sortedExp[i].name,
            value: sortedExp[i].number,
            level: sortedExp[i].level,
          })
        }
      }

      tempArray.reverse()

      const winnersArray = [sortedExp[0], sortedExp[1], sortedExp[2]]

      tempArray.forEach((element, index) => {
        element.name = `${index + 1}. ${element.name}`
        element.value = `Exp: ${element.value}\nLvl: ${element.level}`
      })

      expEmbed.fields = [...tempArray]

      const attachment = await renderCanvas(winnersArray)

      // sortedExp.forEach((element) => {
      //   expEmbed.fields.push({
      //     name: element.name,
      //     value: element.number,
      //   })
      // })

      // console.log("expEmbed: ", expEmbed)

      expEmbed.image = {
        url: "attachment://ranking-image.png",
      }

      await interaction.editReply({ embeds: [expEmbed], files: [attachment] })
    } catch (error) {
      console.error(error)
    }
  },
}
