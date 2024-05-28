const { SlashCommandBuilder } = require("discord.js")
const mongoose = require("mongoose")
const Player = require("../../helpers/playerSchema.js")
require("dotenv").config()

const uri = process.env.MONGODB_URI
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
}

module.exports = {
  cooldown: 0,
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes an ign from the leaderboard.")
    .addStringOption((option) =>
      option
        .setName("ign")
        .setDescription("The name of the character you wish to remove.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply()
      const inputName =
        interaction.options.getString("ign") ?? "No ign provided"
      await mongoose.connect(uri, clientOptions)
      const filter = { name: inputName }
      //   const update = { name: inputName }
      //   const options = { upsert: true, new: true }
      const result = await Player.deleteOne(filter)
      console.log(result)
      if (result.deletedCount > 0) {
        await interaction.editReply(
          `${inputName} removed from the leaderboard.`
        )
      } else {
        await interaction.editReply(`${inputName} is not on the leaderboard.`)
      }
    } catch (error) {
      console.log(error)
    }
  },
}
