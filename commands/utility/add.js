const { SlashCommandBuilder } = require("discord.js")
const mongoose = require("mongoose")
const Player = require("../../helpers/playerSchema.js")
require("dotenv").config()
// const playerSchema = mongoose.Schema({
//   name: String,
// })

// const Player = mongoose.model("Player", playerSchema)

const uri = process.env.MONGODB_URI
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Adds an ign to the leaderboard")
    .addStringOption((option) =>
      option
        .setName("ign")
        .setDescription("The name of the character you wish to add")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply()
      const inputName =
        interaction.options.getString("ign") ?? "No ign provided"
      await mongoose.connect(uri, clientOptions)
      const filter = { name: inputName }
      const update = { name: inputName }
      const options = { upsert: true, new: true }
      const result = await Player.updateOne(filter, update, options)
      if (result.upsertedCount > 0) {
        console.log(`Document updated: ${result}`)
        await interaction.editReply(
          `Succesfully added ${inputName} to the leaderboard.`
        )
      } else if (result.matchedCount > 0) {
        await interaction.editReply(
          `${inputName} is already on the leaderboard.`
        )
      } else {
        console.log(result)
        await interaction.editReply(`Failed to update leaderboard.`)
      }
    } catch (error) {
      console.log(error)
    }
  },
}
