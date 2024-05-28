const { Events, Collection } = require("discord.js")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    console.log("arf")
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    const { cooldowns } = interaction.client
    // console.log("cooldowns: ", cooldowns)
    console.log("guild: ", interaction.guild.id)

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(command.data.name)
    const defaultCooldownDuration = 0
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000

    if (timestamps.has(interaction.guild.id)) {
      console.log("meow")
      const expirationTime =
        timestamps.get(interaction.guild.id) + cooldownAmount

      if (now < expirationTime) {
        console.log("woof")
        const timeLeft = (expirationTime - now) / 1_000
        console.log(
          `Cooldown active. Time left: ${timeLeft.toFixed(1)} seconds`
        )

        return await interaction.reply(
          `Please wait ${timeLeft.toFixed(
            0
          )} more second(s) before reusing the \`${
            command.data.name
          }\` command.`
        )
      } else {
        console.log(
          `Cooldown expired, but still in collection for guild ID: ${interaction.guild.id}`
        )
      }
    } else {
      console.log("No cooldown found for this guild.")
    }

    // Log setting a new cooldown
    console.log(
      `Setting new cooldown for guild ID: ${interaction.guild.id} at ${now}`
    )
    timestamps.set(interaction.guild.id, now)

    // Clear the cooldown after the duration has passed
    setTimeout(() => {
      console.log(`Clearing cooldown for guild ID: ${interaction.guild.id}`)
      timestamps.delete(interaction.guild.id)
    }, cooldownAmount)

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        })
      }
    }
  },
}
