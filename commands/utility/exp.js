const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js")
const { fetchExp } = require("./../../helpers/fetchExp")
const { request } = require("undici")
const Canvas = require("@napi-rs/canvas")

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
        // "traemon",
        // "meleeking",
        // "kinkflip",
        // "salary",
        // "plimbotoilet",
        // "camperdown",
        // "outer",
        // "boredy",
        // "biepo",
        // "moonlemon",
        // "leppington",
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
        title: "Hole Exp Leaderboard",
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

      // const canvas = Canvas.createCanvas(700, 350)
      // const context = canvas.getContext("2d")
      // const background = await Canvas.loadImage("./wallpaper.jpg")

      // context.drawImage(background, 0, 0, canvas.width, canvas.height)

      // const { body } = await request(sortedExp[0].image)
      // const character = await Canvas.loadImage(await body.arrayBuffer())

      // context.drawImage(character, 275, 30, 154, 154)

      // const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      //   name: "ranking-image.png",
      // })

      async function renderCanvas(winnersArray) {
        const canvas = Canvas.createCanvas(700, 350)
        const context = canvas.getContext("2d")
        const background = await Canvas.loadImage("./wallpaper.jpg")

        context.drawImage(background, 0, 0, canvas.width, canvas.height)

        // Array to store promises for image loading
        const imagePromises = []

        // Function to load an image and draw it on canvas
        async function loadImageAndDraw(url, x, y, width, height) {
          const response = await request(url)
          const imageBuffer = await response.body.arrayBuffer()
          const image = await Canvas.loadImage(imageBuffer)
          context.drawImage(image, x, y, width, height)
        }

        imagePromises.push(loadImageAndDraw(winnersArray[0], 275, 25, 154, 154))
        imagePromises.push(loadImageAndDraw(winnersArray[1], 80, 65, 154, 154))
        imagePromises.push(loadImageAndDraw(winnersArray[2], 470, 80, 154, 154))
        s
        await Promise.allSettled(imagePromises)

        const attachment = new AttachmentBuilder(await canvas.encode("png"), {
          name: "ranking-image.png",
        })

        return attachment
      }

      const winnersArray = [
        sortedExp[0].image,
        sortedExp[1].image,
        sortedExp[2].image,
      ]

      const attachment = await renderCanvas(winnersArray)

      sortedExp.forEach((element) => {
        expEmbed.fields.push({
          name: element.name,
          value: element.number,
        })
      })

      expEmbed.image = {
        url: "attachment://ranking-image.png",
      }

      await interaction.editReply({ embeds: [expEmbed], files: [attachment] })
    } catch (error) {
      console.error(error)
    }
  },
}
